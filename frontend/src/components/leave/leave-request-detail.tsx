'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, ClockIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { Leave, LeaveStatus, UserRole } from '@/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePermissions } from '@/hooks/use-permissions';

interface LeaveRequestDetailProps {
  leave: Leave;
  userRole: UserRole;
  userId: string;
}

export function LeaveRequestDetail({ leave, userRole, userId }: LeaveRequestDetailProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const supabase = createClientComponentClient();

  const { can } = usePermissions(userRole);

  const isOwnRequest = userId === leave.requester_id;

  const canApprove = can('leaves.approve') && !isOwnRequest && leave.status === 'pending';

  const canCancel = isOwnRequest && leave.status === 'pending';


  // Map status to supported Badge variants in our UI library
  const getStatusBadgeVariant = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/leaves/${leave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          approver_id: userId,
          approved_at: new Date().toISOString(),
          comment: comment || null,
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve leave request');
      }
    
      toast.success('Leave request approved successfully');
      setShowApproveDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error approving leave request:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/leaves/${leave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          approver_id: userId,
          approved_at: new Date().toISOString(),
          comment: comment || null,
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject leave request');
      }
    
      toast.success('Leave request rejected');
      setShowRejectDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/leaves/${leave.id}`, {
        method: 'DELETE',
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel leave request');
      }
    
      toast.success('Leave request canceled');
      router.push('/dashboard/leaves');
    } catch (error) {
      console.error('Error canceling leave request:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Leave Request Details</CardTitle>
          <Badge variant={getStatusBadgeVariant(leave.status)}>
            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Employee</p>
              <p className="font-medium">{leave.requester?.first_name} {leave.requester?.last_name || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
              <p className="font-medium">{leave.leave_type?.name || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <p className="font-medium">{format(new Date(leave.start_date), 'PPP')}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <p className="font-medium">{format(new Date(leave.end_date), 'PPP')}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Days Count</p>
              <p className="font-medium">{leave.days_count} day{leave.days_count !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Requested On</p>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4 opacity-70" />
                <p className="font-medium">{format(new Date(leave.created_at), 'PPP')}</p>
              </div>
            </div>
          </div>

          {leave.reason && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Reason</p>
                <p>{leave.reason}</p>
              </div>
            </>
          )}

          {leave.reviewer_comment && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Manager Comment</p>
                <p>{leave.reviewer_comment}</p>
              </div>
            </>
          )}

          {leave.status !== 'pending' && leave.approver && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {leave.status === 'approved' ? 'Approved by' : 'Rejected by'}
                </p>
                <div className="flex items-center justify-between">
                  <p>{leave.approver.first_name} {leave.approver.last_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {leave.approved_at ? format(new Date(leave.approved_at), 'PPP') : ''}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <div className="flex space-x-2">
            {isOwnRequest && leave.status === 'pending' && (
              <Button variant="outline" onClick={() => router.push(`/dashboard/leaves/${leave.id}/edit`)} disabled={isSubmitting}>
                Edit Request
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
                Cancel Request
              </Button>
            )}
            {canApprove && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isSubmitting}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isSubmitting}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this leave request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this leave request?
            </AlertDialogDescription>

          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add a reason for rejection (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}