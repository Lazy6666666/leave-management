import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leaveRequestSchema } from '@/lib/validations/leave'; // Corrected import path
import { z } from 'zod'; // Import z for schema inference

// Define a type for the incoming leave request data
type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: employeeData } = await supabase
      .from('employees')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = employeeData?.role || 'employee';

    let query = supabase
      .from('leaves')
      .select('*, requester:employees!leaves_requester_id_fkey(id, name, email), leave_type:leave_types!leaves_leave_type_id_fkey(id, name)')
      .order('created_at', { ascending: false });

    if (userRole === 'employee') {
      query = query.eq('requester_id', user.id);
    } else if (userRole === 'manager') {
      const { data: teamMembers } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', user.id);

      if (teamMembers) {
        const teamMemberIds = teamMembers.map(member => member.id);
        query = query.in('requester_id', teamMemberIds);
      } else {
        query = query.eq('requester_id', user.id); // fallback
      }
    }
    // For admin, no filter

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch leaves: ${error.message}`);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData: LeaveRequestFormData = leaveRequestSchema.parse(body);

    // Calculate days_count
    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const daysCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const { data, error } = await supabase
      .from('leaves')
      .insert({
        requester_id: user.id,
        leave_type_id: validatedData.leave_type_id,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        reason: validatedData.reason,
        days_count: daysCount,
        status: 'pending', // Default status
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create leave request: ${error.message}`);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.leaves
- GET: SELECT policies
  • leaves_requester_select – requester can view own requests
  • leaves_approver_select – approver can view assigned requests
  • leaves_department_select – manager/admin/hr can view department requests
  • leaves_admin_select – admin/hr can view all
- POST: INSERT policy
  • leaves_requester_insert – requester can create pending request, no approver assigned

Related functions potentially used by API logic or RPC:
  • check_overlapping_leaves(uuid, date, date, uuid)
  • get_available_leave_days(uuid, uuid, integer)
*/