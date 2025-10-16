'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveRequestDetail } from '@/components/leave/leave-request-detail';
import { Leave, UserRole } from '@/types';

export default function LeaveDetailPage() {
  const [leave, setLeave] = useState<Leave | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const leaveId = params.id as string;
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUserId(user.id);

        // Get user role
        const { data: employeeData } = await supabase
          .from('employees')
          .select('role')
          .eq('id', user.id)
          .single();

        if (employeeData) {
          setUserRole(employeeData.role as UserRole);
        }

        // Load leave details from API
        const response = await fetch(`/api/leaves/${leaveId}`);
        if (!response.ok) {
          if (response.status === 403) {
            router.push('/dashboard/leaves');
            return;
          }
          const errorText = await response.text();
          throw new Error(`Failed to fetch leave: ${errorText}`);
        }

        const { data: leaveData } = await response.json();

        if (leaveData) {
          setLeave(leaveData);
        }
      } catch (error) {
        console.error('Error loading leave details:', error);
        // Optionally, redirect to an error page or show a toast
      } finally {
        setIsLoading(false);
      }
    }

    if (leaveId) {
      loadData();
    }
  }, [leaveId, router, supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Leave Request</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Leave Request Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">The requested leave could not be found or you do not have permission to view it.</p>
            <button onClick={() => router.push('/dashboard/leaves')} className="mt-4 text-primary hover:underline">
              Go back to Leave Requests
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Leave Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestDetail
            leave={leave}
            userRole={userRole}
            userId={userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}