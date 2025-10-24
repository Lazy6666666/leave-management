import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * RLS Policy References
 *
 * This reporting endpoint performs a SELECT over aggregated leave data.
 * It reads from public.leaves and joins leave_types. Access to rows is
 * governed by the leaves SELECT policies and employees/leave_types policies:
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

// GET /api/reports/leave-by-type
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const department = searchParams.get('department');

    let query = supabase
      .from('leaves')
      .select(`
        *,
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

    const { data: leaves, error } = await query;

    if (error) {
      console.error('Error fetching leave data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave data' },
        { status: 500 }
      );
    }

    // Group by leave type
    const typeCounts: Record<string, number> = {};
    leaves.forEach(leave => {
      const typeName = leave.leave_types.name;
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    const total = leaves.length;
    const leaveByType = Object.entries(typeCounts).map(([leave_type, count]) => ({
      leave_type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0,
    }));

    return NextResponse.json({ data: leaveByType });
  } catch (error) {
    console.error('Error in GET /api/reports/leave-by-type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}