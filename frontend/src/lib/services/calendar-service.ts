import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface LeaveEvent {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  color: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface LeaveType {
  id: string;
  name: string;
  color: string;
}

export interface CalendarFilters {
  departmentId?: string;
  leaveTypeId?: string;
  status?: string;
  month: Date;
}

class CalendarService {
  private supabase = createClient();

  async getDepartments(): Promise<Department[]> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching departments:', error);
      throw new Error('Could not fetch departments.');
    }
    return (data ?? []) as Department[];
  }

  async getLeaveTypes(): Promise<LeaveType[]> {
    const { data, error } = await this.supabase
      .from('leave_types')
      .select('id, name, color')
      .order('name');
    
    if (error) {
      console.error('Error fetching leave types:', error);
      throw new Error('Could not fetch leave types.');
    }
    return data as LeaveType[];
  }

  async getLeaveEvents(filters: CalendarFilters): Promise<LeaveEvent[]> {
    const { departmentId, leaveTypeId, status, month } = filters;
    const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

    let query = this.supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        status,
        leave_types (id, name, color),
        employees (id, first_name, last_name, department_id)
      `)
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    if (departmentId && departmentId !== 'all') {
      query = query.eq('employees.department_id', departmentId);
    }

    if (leaveTypeId && leaveTypeId !== 'all') {
      query = query.eq('leave_type_id', leaveTypeId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leave events:', error);
      throw new Error('Could not fetch leave events.');
    }
    
    interface LeaveEventRow {
      id: string;
      start_date: string;
      end_date: string;
      status: 'pending' | 'approved' | 'rejected' | 'cancelled' | string;
      leave_types: { id: string; name: string; color?: string | null } | { id: string; name: string; color?: string | null }[];
      employees: { id: string; first_name: string; last_name: string; department_id: string } | { id: string; first_name: string; last_name: string; department_id: string }[];
    }

    return (data ?? []).map((item: LeaveEventRow) => {
      const leaveType = Array.isArray(item.leave_types) ? item.leave_types[0] : item.leave_types;
      const employee = Array.isArray(item.employees) ? item.employees[0] : item.employees;
      return {
        id: item.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        employeeId: employee.id,
        leaveType: leaveType.name,
        startDate: new Date(item.start_date),
        endDate: new Date(item.end_date),
        status: item.status as LeaveEvent['status'],
        color: leaveType.color || '#3b82f6',
      };
    });
  }
}

export const calendarService = new CalendarService();