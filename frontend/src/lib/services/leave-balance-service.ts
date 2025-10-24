import { createClient } from '@/lib/supabase/client';

type SupabaseLeaveBalance = {
  id: string;
  employee_id: string;
  leave_type_id: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
  year: number;
  last_updated: string;
  carry_forward_days?: number;
  is_active: boolean;
  leave_types: {
    id: string;
    name: string;
    color: string;
    requires_approval: boolean;
    max_days_per_year: number;
  };
};

type SupabaseLeaveBalanceTransaction = {
  id: string;
  employee_id: string;
  leave_type_id: string;
  transaction_type: 'accrual' | 'used' | 'adjusted' | 'carried_forward' | 'expired';
  days: number;
  reason: string;
  reference_id?: string;
  created_at: string;
  created_by: string;
  created_by_user: {
    first_name: string;
    last_name: string;
  };
};

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  lastUpdated: Date;
  carryForwardDays?: number;
  isActive: boolean;
  // UI convenience fields from joined leave_types
  leaveTypeName?: string;
  leaveTypeColor?: string;
}

export interface LeaveAccrualRule {
  id: string;
  leaveTypeId: string;
  accrualRate: number; // days per month/year
  accrualPeriod: 'monthly' | 'yearly';
  maxCarryForward: number;
  carryForwardExpiryMonths: number;
  isActive: boolean;
}

export interface LeaveBalanceTransaction {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  transactionType: 'accrual' | 'used' | 'adjusted' | 'carried_forward' | 'expired';
  days: number;
  reason: string;
  referenceId?: string; // leave_request_id or adjustment_id
  createdAt: Date;
  createdBy: string;
}

class LeaveBalanceService {
  private supabase = createClient();

  // Get leave balance for employee
  async getEmployeeLeaveBalance(employeeId: string, year?: number): Promise<LeaveBalance[]> {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const { data, error } = await this.supabase
        .from('leave_balances')
        .select(`
          *,
          leave_types (
            id,
            name,
            color,
            requires_approval,
            max_days_per_year
          )
        `)
        .eq('employee_id', employeeId)
        .eq('year', targetYear)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(this.transformLeaveBalance);
    } catch (error) {
      console.error('Error fetching employee leave balance:', error);
      throw error;
    }
  }

  // Get leave balance for specific leave type
  async getLeaveBalance(employeeId: string, leaveTypeId: string, year?: number): Promise<LeaveBalance | null> {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const { data, error } = await this.supabase
        .from('leave_balances')
        .select(`
          *,
          leave_types (
            id,
            name,
            color,
            requires_approval,
            max_days_per_year
          )
        `)
        .eq('employee_id', employeeId)
        .eq('leave_type_id', leaveTypeId)
        .eq('year', targetYear)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? this.transformLeaveBalance(data) : null;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  // Update leave balance when leave is taken
  async updateBalanceForLeaveRequest(employeeId: string, leaveTypeId: string, days: number, leaveRequestId: string): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Get current balance
      const balance = await this.getLeaveBalance(employeeId, leaveTypeId, currentYear);
      
      if (!balance) {
        throw new Error('Leave balance not found');
      }

      if (balance.remainingDays < days) {
        throw new Error('Insufficient leave balance');
      }

      // Update balance
      const { error: updateError } = await this.supabase
        .from('leave_balances')
        .update({
          used_days: balance.usedDays + days,
          remaining_days: balance.remainingDays - days,
          last_updated: new Date().toISOString()
        })
        .eq('id', balance.id);

      if (updateError) throw updateError;

      // Record transaction
      await this.createTransaction({
        employeeId,
        leaveTypeId,
        transactionType: 'used',
        days: -days,
        reason: 'Leave request approved',
        referenceId: leaveRequestId,
        createdBy: employeeId
      });

    } catch (error) {
      console.error('Error updating leave balance for leave request:', error);
      throw error;
    }
  }

  // Process monthly accrual for all employees
  async processMonthlyAccrual(): Promise<void> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      // Get all active accrual rules
      const { data: rules, error: rulesError } = await this.supabase
        .from('leave_accrual_rules')
        .select('*')
        .eq('is_active', true)
        .eq('accrual_period', 'monthly');

      if (rulesError) throw rulesError;

      // Process each rule
      for (const rule of rules || []) {
        await this.processAccrualForRule(rule, currentYear, currentMonth);
      }

    } catch (error) {
      console.error('Error processing monthly accrual:', error);
      throw error;
    }
  }

  // Process accrual for specific rule
  private async processAccrualForRule(rule: LeaveAccrualRule, year: number, month: number): Promise<void> {
    try {
      // Get all active employees
      const { data: employees, error: employeesError } = await this.supabase
        .from('employees')
        .select('id, hire_date')
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Process each employee
      for (const employee of employees || []) {
        await this.accrueLeaveForEmployee(employee.id, rule, year, month);
      }

    } catch (error) {
      console.error('Error processing accrual for rule:', error);
      throw error;
    }
  }

  // Accrue leave for specific employee
  private async accrueLeaveForEmployee(employeeId: string, rule: LeaveAccrualRule, year: number, month: number): Promise<void> {
    try {
      // Check if already accrued this month
      const { data: existingTransaction } = await this.supabase
        .from('leave_balance_transactions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('leave_type_id', rule.leaveTypeId)
        .eq('transaction_type', 'accrual')
        .eq('reference_id', `${year}-${month.toString().padStart(2, '0')}`)
        .single();

      if (existingTransaction) {
        console.log(`Leave already accrued for employee ${employeeId} this month`);
        return;
      }

      // Get or create balance
      let balance = await this.getLeaveBalance(employeeId, rule.leaveTypeId, year);
      
      if (!balance) {
        balance = await this.createLeaveBalance(employeeId, rule.leaveTypeId, year);
      }

      // Update balance
      const newTotalDays = balance.totalDays + rule.accrualRate;
      const newRemainingDays = balance.remainingDays + rule.accrualRate;

      const { error: updateError } = await this.supabase
        .from('leave_balances')
        .update({
          total_days: newTotalDays,
          remaining_days: newRemainingDays,
          last_updated: new Date().toISOString()
        })
        .eq('id', balance.id);

      if (updateError) throw updateError;

      // Record transaction
      await this.createTransaction({
        employeeId,
        leaveTypeId: rule.leaveTypeId,
        transactionType: 'accrual',
        days: rule.accrualRate,
        reason: `Monthly accrual for ${month}/${year}`,
        referenceId: `${year}-${month.toString().padStart(2, '0')}`,
        createdBy: 'system'
      });

    } catch (error) {
      console.error('Error accruing leave for employee:', error);
      throw error;
    }
  }

  // Create new leave balance
  private async createLeaveBalance(employeeId: string, leaveTypeId: string, year: number): Promise<LeaveBalance> {
    try {
      const { data, error } = await this.supabase
        .from('leave_balances')
        .insert({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year,
          total_days: 0,
          used_days: 0,
          remaining_days: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformLeaveBalance(data);
    } catch (error) {
      console.error('Error creating leave balance:', error);
      throw error;
    }
  }

  // Create balance transaction
  private async createTransaction(transaction: Omit<LeaveBalanceTransaction, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('leave_balance_transactions')
        .insert({
          employee_id: transaction.employeeId,
          leave_type_id: transaction.leaveTypeId,
          transaction_type: transaction.transactionType,
          days: transaction.days,
          reason: transaction.reason,
          reference_id: transaction.referenceId,
          created_by: transaction.createdBy,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Process year-end carry forward
  async processYearEndCarryForward(): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      // Get all accrual rules with carry forward
      const { data: rules, error: rulesError } = await this.supabase
        .from('leave_accrual_rules')
        .select('*')
        .eq('is_active', true)
        .gt('max_carry_forward', 0);

      if (rulesError) throw rulesError;

      // Process each rule
      for (const rule of rules || []) {
        await this.processCarryForwardForRule(rule, previousYear, currentYear);
      }

    } catch (error) {
      console.error('Error processing year-end carry forward:', error);
      throw error;
    }
  }

  // Process carry forward for specific rule
  private async processCarryForwardForRule(rule: LeaveAccrualRule, fromYear: number, toYear: number): Promise<void> {
    try {
      // Get all employees with balances for previous year
      const { data: balances, error: balancesError } = await this.supabase
        .from('leave_balances')
        .select('*')
        .eq('leave_type_id', rule.leaveTypeId)
        .eq('year', fromYear)
        .eq('is_active', true)
        .gt('remaining_days', 0);

      if (balancesError) throw balancesError;

      // Process each balance
      for (const balance of balances || []) {
        const carryForwardDays = Math.min(balance.remaining_days, rule.maxCarryForward);
        
        if (carryForwardDays > 0) {
          await this.processCarryForwardForEmployee(balance.employee_id, rule.leaveTypeId, carryForwardDays, toYear);
        }
      }

    } catch (error) {
      console.error('Error processing carry forward for rule:', error);
      throw error;
    }
  }

  // Process carry forward for specific employee
  private async processCarryForwardForEmployee(employeeId: string, leaveTypeId: string, carryForwardDays: number, year: number): Promise<void> {
    try {
      // Get or create balance for new year
      let balance = await this.getLeaveBalance(employeeId, leaveTypeId, year);
      
      if (!balance) {
        balance = await this.createLeaveBalance(employeeId, leaveTypeId, year);
      }

      // Update balance with carry forward
      const newTotalDays = balance.totalDays + carryForwardDays;
      const newRemainingDays = balance.remainingDays + carryForwardDays;

      const { error: updateError } = await this.supabase
        .from('leave_balances')
        .update({
          total_days: newTotalDays,
          remaining_days: newRemainingDays,
          carry_forward_days: carryForwardDays,
          last_updated: new Date().toISOString()
        })
        .eq('id', balance.id);

      if (updateError) throw updateError;

      // Record transaction
      await this.createTransaction({
        employeeId,
        leaveTypeId,
        transactionType: 'carried_forward',
        days: carryForwardDays,
        reason: `Year-end carry forward from ${year - 1}`,
        createdBy: 'system'
      });

    } catch (error) {
      console.error('Error processing carry forward for employee:', error);
      throw error;
    }
  }

  // Get leave balance history
  async getLeaveBalanceHistory(employeeId: string, leaveTypeId: string, year?: number): Promise<LeaveBalanceTransaction[]> {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const { data, error } = await this.supabase
        .from('leave_balance_transactions')
        .select(`
          *,
          created_by_user:profiles!leave_balance_transactions_created_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('employee_id', employeeId)
        .eq('leave_type_id', leaveTypeId)
        .gte('created_at', `${targetYear}-01-01`)
        .lte('created_at', `${targetYear}-12-31`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.transformTransaction);
    } catch (error) {
      console.error('Error fetching leave balance history:', error);
      throw error;
    }
  }

  // Manual balance adjustment
  async adjustBalance(employeeId: string, leaveTypeId: string, days: number, reason: string, adjustedBy: string): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Get current balance
      let balance = await this.getLeaveBalance(employeeId, leaveTypeId, currentYear);
      
      if (!balance) {
        balance = await this.createLeaveBalance(employeeId, leaveTypeId, currentYear);
      }

      // Update balance
      const newRemainingDays = balance.remainingDays + days;
      const newTotalDays = days > 0 ? balance.totalDays + days : balance.totalDays;

      const { error: updateError } = await this.supabase
        .from('leave_balances')
        .update({
          total_days: newTotalDays,
          remaining_days: newRemainingDays,
          last_updated: new Date().toISOString()
        })
        .eq('id', balance.id);

      if (updateError) throw updateError;

      // Record transaction
      await this.createTransaction({
        employeeId,
        leaveTypeId,
        transactionType: 'adjusted',
        days,
        reason,
        createdBy: adjustedBy
      });

    } catch (error) {
      console.error('Error adjusting leave balance:', error);
      throw error;
    }
  }

  private transformLeaveBalance(data: SupabaseLeaveBalance): LeaveBalance {
    return {
      id: data.id,
      employeeId: data.employee_id,
      leaveTypeId: data.leave_type_id,
      totalDays: data.total_days,
      usedDays: data.used_days,
      remainingDays: data.remaining_days,
      year: data.year,
      lastUpdated: new Date(data.last_updated),
      carryForwardDays: data.carry_forward_days,
      isActive: data.is_active,
      leaveTypeName: data.leave_types?.name,
      leaveTypeColor: data.leave_types?.color
    };
  }

  private transformTransaction(data: SupabaseLeaveBalanceTransaction): LeaveBalanceTransaction {
    return {
      id: data.id,
      employeeId: data.employee_id,
      leaveTypeId: data.leave_type_id,
      transactionType: data.transaction_type,
      days: data.days,
      reason: data.reason,
      referenceId: data.reference_id,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    };
  }
}

export const leaveBalanceService = new LeaveBalanceService();
export default leaveBalanceService;