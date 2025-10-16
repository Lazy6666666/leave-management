import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leaveApprovalSchema } from '@/lib/validations/leave';
import { UserRole, LeaveStatus } from '@/types';
import { z } from 'zod';

type LeaveApprovalFormData = z.infer<typeof leaveApprovalSchema>;

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: leaveData, error } = await supabase
      .from('leaves')
      .select(`
        *,
        requester:employees!leaves_requester_id_fkey(id, first_name, last_name, email, department, role),
        approver:employees!leaves_approver_id_fkey(id, first_name, last_name, email),
        leave_type:leave_types!leaves_leave_type_id_fkey(id, name)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch leave: ${error.message}`);
    }

    if (!leaveData) {
      return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
    }

    // Permission check
    const { data: userEmployee } = await supabase
      .from('employees')
      .select('role, id')
      .eq('id', user.id)
      .single();

    const userRole = userEmployee?.role || 'employee';
    const isOwner = leaveData.requester_id === user.id;
    let isManager = false;

    if (userRole === 'manager') {
      const { data: teamMembers } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', user.id);

      if (teamMembers?.some(member => member.id === leaveData.requester_id)) {
        isManager = true;
      }
    }

    const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

    if (!isOwner && !isManager && !isAdminOrHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: leaveData });
  } catch (error) {
    console.error('Error fetching leave:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userEmployee } = await supabase
      .from('employees')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = userEmployee?.role || 'employee';
    const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

    if (!isAdminOrHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData: LeaveApprovalFormData = leaveApprovalSchema.parse(body);

    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: validatedData.status,
        approver_id: user.id,
        approved_at: new Date().toISOString(),
        reviewer_comment: validatedData.comment,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update leave request: ${error.message}`);
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the requester can delete their own pending leave request
    const { data: leaveData, error: fetchError } = await supabase
      .from('leaves')
      .select('requester_id, status')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch leave for deletion: ${fetchError.message}`);
    }

    if (!leaveData) {
      return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
    }

    if (leaveData.requester_id !== user.id || leaveData.status !== 'pending') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('leaves')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error(`Failed to delete leave request: ${error.message}`);
    }

    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.leaves
- GET: SELECT policies
  • leaves_requester_select
  • leaves_approver_select
  • leaves_department_select
  • leaves_admin_select
- DELETE: DELETE policies
  • leaves_requester_delete – requester can delete own pending requests
  • leaves_admin_hr_delete – admin/hr can delete any
*/