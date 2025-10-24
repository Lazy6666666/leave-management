'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveRequestList } from '@/components/leave/leave-request-list';
import { Leave, LeaveType, UserRole } from '@/types';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
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

        // Get user role
        const { data: employeeData } = await supabase
          .from('employees')
          .select('role')
          .eq('id', user.id)
          .single();

        if (employeeData) {
          setUserRole(employeeData.role as UserRole);
        }

        // Load leave types
        const { data: leaveTypesData } = await supabase
          .from('leave_types')
          .select('*')
          .order('name');

        if (leaveTypesData) {
          setLeaveTypes(leaveTypesData);
        }

        // Load leaves from API
        const response = await fetch('/api/leaves');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch leaves: ${errorText}`);
        }
        const { data: leavesData } = await response.json();

        if (leavesData) {
          setLeaves(leavesData);
        }
      } catch (error) {
        console.error('Error loading leaves:', error);
        // Optionally, redirect to an error page or show a toast
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Leave Requests</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button onClick={() => router.push('/dashboard/leaves/new')}>
          New Leave Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestList
            leaves={leaves}
            leaveTypes={leaveTypes}
            isManager={userRole === 'manager' || userRole === 'admin'}
          />
        </CardContent>
      </Card>
    </div>
  );
}