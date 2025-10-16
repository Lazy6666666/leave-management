import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * RLS Policy References
 *
 * This reporting endpoint aggregates statistics from public.leaves joined with
 * employees and leave_types. Access to rows is governed by:
 *
 * - public.leaves (SELECT):
 *   - "leaves_requester_select" — Requesters can view their own leaves
 *   - "leaves_approver_select" — Approvers can view assigned leaves
 *   - "leaves_department_select" — Managers can view leaves in their department
 *   - "leaves_admin_select" — Admin/HR can view all leaves
 *
 * - public.employees (SELECT):
 *   - "employees_self_access" — Users can view their own profile
 *   - "employees_department_access" — Managers can view department employees
 *   - "employees_admin_access" — Admin/HR can view all employees
 *
 * - public.leave_types (SELECT):
 *   - "leave_types_read_all" — All authenticated users can read leave types
 *
 * See:
 * - docs/backend-functions-and-policies.md#004_refine_rls_leavessql
 * - docs/backend-functions-and-policies.md#006_rls_calendar_documents_reportingsql
 */
// GET /api/reports/leave-stats
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const department = searchParams.get('department');
    const leaveType = searchParams.get('leave_type');

    let query = supabase
      .from('leaves')
      .select(`
        *,
        employees!inner(department_id, first_name, last_name),
        leave_types!inner(name)
      `);

    // Apply date range filter
    if (startDate && endDate) {
      query = query
        .gte('start_date', startDate)
        .lte('end_date', endDate);
    }

    // Apply department filter
    if (department && department !== 'all') {
      query = query.eq('employees.department_id', department);
    }

    // Apply leave type filter
    if (leaveType && leaveType !== 'all') {
      query = query.eq('leave_type_id', leaveType);
    }

    const { data: leaves, error } = await query;

    if (error) {
      console.error('Error fetching leave data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave data' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalRequests = leaves.length;
    const approvedRequests = leaves.filter(l => l.status === 'approved').length;
    const pendingRequests = leaves.filter(l => l.status === 'pending').length;
    const rejectedRequests = leaves.filter(l => l.status === 'rejected').length;
    
    // Calculate utilization rate (assuming 20 working days per month)
    const totalDays = leaves.reduce((sum, leave) => {
      if (leave.status === 'approved') {
        const days = Math.ceil(
          (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        ) + 1;
        return sum + days;
      }
      return sum;
    }, 0);
    const utilizationRate = totalRequests > 0 ? (totalDays / (totalRequests * 20)) * 100 : 0;

    // Calculate average processing time
    const processedLeaves = leaves.filter(l => l.status !== 'pending' && l.updated_at);
    const avgProcessingTime = processedLeaves.length > 0
      ? processedLeaves.reduce((sum, leave) => {
          const created = new Date(leave.created_at);
          const updated = new Date(leave.updated_at);
          const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / processedLeaves.length
      : 0;

    const stats = {
      totalRequests,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      averageProcessingTime: Math.round(avgProcessingTime * 100) / 100,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Error in GET /api/reports/leave-stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}