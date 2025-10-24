import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const departmentId = searchParams.get('department_id');
    const leaveTypeId = searchParams.get('leave_type_id');
    const status = searchParams.get('status');

    // Build the query
    let query = supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        status,
        reason,
        created_at,
        leave_types (
          id,
          name,
          color,
          requires_approval
        ),
        employees (
          id,
          first_name,
          last_name,
          email,
          departments (
            id,
            name
          )
        ),
        approvers (
          id,
          first_name,
          last_name
        )
      `)
      .gte('start_date', startDate || new Date().toISOString().split('T')[0])
      .lte('end_date', endDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]);

    // Apply filters
    if (departmentId && departmentId !== 'all') {
      query = query.eq('employees.department_id', departmentId);
    }

    if (leaveTypeId && leaveTypeId !== 'all') {
      query = query.eq('leave_type_id', leaveTypeId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar data' },
        { status: 500 }
      );
    }

    // Transform data for calendar consumption
    const calendarEvents = data.map(event => {
      const employeeRaw = event.employees as any;
      const leaveTypeRaw = event.leave_types as any;
      const approverRaw = event.approvers as any;

      const employee = Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw;
      const leaveType = Array.isArray(leaveTypeRaw) ? leaveTypeRaw[0] : leaveTypeRaw;
      const approver = approverRaw ? (Array.isArray(approverRaw) ? approverRaw[0] : approverRaw) : null;
      const departmentRaw = employee?.departments as any;
      const department = Array.isArray(departmentRaw) ? departmentRaw[0] : departmentRaw;

      return {
        id: event.id,
        title: `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim(),
        start: event.start_date,
        end: event.end_date,
        status: event.status,
        leaveType: leaveType?.name,
        leaveTypeColor: leaveType?.color,
        employee: {
          id: employee?.id,
          name: `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim(),
          email: employee?.email,
          department: department?.name ?? 'No Department',
        },
        reason: event.reason,
        requiresApproval: !!leaveType?.requires_approval,
        approver: approver ? `${approver.first_name ?? ''} ${approver.last_name ?? ''}`.trim() : null,
        createdAt: event.created_at,
      };
    });

    return NextResponse.json({ 
      events: calendarEvents,
      total: calendarEvents.length,
      dateRange: {
        start: startDate,
        end: endDate,
      }
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { start_date, end_date, department_id, leave_type_id, status } = body;

    // Validate required fields
    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase
      .from('leave_requests')
      .select(`
        id,
        start_date,
        end_date,
        status,
        reason,
        created_at,
        leave_types (
          id,
          name,
          color,
          requires_approval
        ),
        employees (
          id,
          first_name,
          last_name,
          email,
          departments (
            id,
            name
          )
        ),
        approvers (
          id,
          first_name,
          last_name
        )
      `)
      .gte('start_date', start_date)
      .lte('end_date', end_date);

    // Apply filters
    if (department_id && department_id !== 'all') {
      query = query.eq('employees.department_id', department_id);
    }

    if (leave_type_id && leave_type_id !== 'all') {
      query = query.eq('leave_type_id', leave_type_id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar data' },
        { status: 500 }
      );
    }

    // Transform data for calendar consumption
    const calendarEvents = data.map(event => {
      const employeeRaw = event.employees as any;
      const leaveTypeRaw = event.leave_types as any;
      const approverRaw = event.approvers as any;

      const employee = Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw;
      const leaveType = Array.isArray(leaveTypeRaw) ? leaveTypeRaw[0] : leaveTypeRaw;
      const approver = approverRaw ? (Array.isArray(approverRaw) ? approverRaw[0] : approverRaw) : null;
      const departmentRaw = employee?.departments as any;
      const department = Array.isArray(departmentRaw) ? departmentRaw[0] : departmentRaw;

      return {
        id: event.id,
        title: `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim(),
        start: event.start_date,
        end: event.end_date,
        status: event.status,
        leaveType: leaveType?.name,
        leaveTypeColor: leaveType?.color,
        employee: {
          id: employee?.id,
          name: `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim(),
          email: employee?.email,
          department: department?.name ?? 'No Department',
        },
        reason: event.reason,
        requiresApproval: !!leaveType?.requires_approval,
        approver: approver ? `${approver.first_name ?? ''} ${approver.last_name ?? ''}`.trim() : null,
        createdAt: event.created_at,
      };
    });

    return NextResponse.json({ 
      events: calendarEvents,
      total: calendarEvents.length,
      dateRange: {
        start: start_date,
        end: end_date,
      }
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.calendar_events
- GET: SELECT policy
  • Users can view own calendar events (employee_id or created_by matches)
  • Managers/Admin/HR can also view all
- POST: INSERT policy
  • Users can create own calendar events (employee_id or created_by matches)
*/