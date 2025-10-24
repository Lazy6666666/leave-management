'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveRequestForm } from '@/components/leave/leave-request-form';
import { LeaveType } from '@/types';

export default function NewLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadLeaveTypes() {
      try {
        const { data, error } = await supabase
          .from('leave_types')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error loading leave types:', error);
          return;
        }

        if (data) {
          setLeaveTypes(data);
        }
      } catch (error) {
        console.error('Error loading leave types:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaveTypes();
  }, [supabase]);

  const handleSuccess = () => {
    router.push('/dashboard/leaves');
    router.refresh();
  };

  const handleCancel = () => {
    router.push('/dashboard/leaves');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm 
            leaveTypes={leaveTypes}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}