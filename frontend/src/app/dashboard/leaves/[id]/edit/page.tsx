import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { LeaveRequestForm } from '@/components/leave/leave-request-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leave, LeaveType } from '@/types';

interface EditLeaveRequestPageProps {
  params: {
    id: string;
  };
}

export default async function EditLeaveRequestPage({ params }: EditLeaveRequestPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { id: leaveId } = params;

  // Fetch leave request data
  const { data: leave, error: leaveError } = await supabase
    .from('leaves')
    .select('*, leave_type(*), requester(*), approver(*)')
    .eq('id', leaveId)
    .single();

  if (leaveError || !leave) {
    console.error('Error fetching leave request:', leaveError?.message);
    notFound();
  }

  // Fetch leave types
  const { data: leaveTypes, error: leaveTypesError } = await supabase
    .from('leave_types')
    .select('*')
    .eq('is_active', true);

  if (leaveTypesError || !leaveTypes) {
    console.error('Error fetching leave types:', leaveTypesError?.message);
    // Optionally, handle this error more gracefully, but for now, proceed with empty types
  }

  // Check if the current user is the requester and the leave is pending
  const { data: { user } } = await supabase.auth.getUser();
  const currentEmployeeId = user?.id; // Assuming supabase_id maps to employee_id

  // In a real app, you'd map supabase_id to your public.employees.id
  // For now, we'll assume a direct match or fetch the employee record
  const { data: employeeData } = await supabase
    .from('employees')
    .select('id')
    .eq('supabase_id', user?.id)
    .single();

  const isRequester = employeeData?.id === leave.requester_id;
  const isPending = leave.status === 'pending';

  if (!isRequester || !isPending) {
    notFound(); // Or redirect to a view-only page with an error message
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm
            leaveTypes={leaveTypes || []}
            initialData={leave as Leave}
            onSuccess={() => {
              // Handle successful update, e.g., redirect to leave details
              // router.push(`/dashboard/leaves/${leave.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}