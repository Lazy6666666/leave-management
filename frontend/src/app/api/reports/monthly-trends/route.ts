import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * RLS Policy References
 *
 * This reporting endpoint computes monthly trends from public.leaves joined with
 * employees and leave_types. Row visibility is controlled by:
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
// GET /api/reports/monthly-trends
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

    // Group by month
    const monthlyStats: Record<string, { requests: number; approved: number }> = {};
    
    leaves.forEach(leave => {
      const month = new Date(leave.start_date).toISOString().slice(0, 7); // YYYY-MM format
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = { requests: 0, approved: 0 };
      }
      
      monthlyStats[month].requests++;
      if (leave.status === 'approved') {
        monthlyStats[month].approved++;
      }
    });

    // Convert to array and sort by month
    const monthlyTrends = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        requests: stats.requests,
        approved: stats.approved,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ data: monthlyTrends });
  } catch (error) {
    console.error('Error in GET /api/reports/monthly-trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}