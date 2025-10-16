'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Eye, MessageCircle, Calendar, User, Mail, Phone, FileText, AlertCircle, ChevronRight, RotateCcw, Check, X, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  reviewer_comment?: string;
  emergency_contact?: string;
  is_paid: boolean;
  employee: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    department: string;
    job_title: string;
    employee_id: string;
    avatar_url?: string;
    manager_id?: string;
  };
  leave_type: {
    id: string;
    name: string;
    color: string;
    requires_approval: boolean;
    max_days_per_year: number;
  };
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  department_manager?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  hr_manager?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ApprovalAction {
  requestId: string;
  action: 'approve' | 'reject';
  comment: string;
}

function LeaveRequestDetails({ 
  request, 
  onApprove, 
  onReject, 
  onRequestMoreInfo,
  loading 
}: { 
  request: LeaveRequest;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onRequestMoreInfo: (comment: string) => void;
  loading?: boolean;
}) {
  const [actionComment, setActionComment] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showInfoRequestDialog, setShowInfoRequestDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    if (actionComment.trim()) {
      onApprove(actionComment);
      setActionComment('');
      setShowApprovalDialog(false);
    }
  };

  const handleReject = () => {
    if (actionComment.trim()) {
      onReject(actionComment);
      setActionComment('');
      setShowRejectionDialog(false);
    }
  };

  const handleRequestMoreInfo = () => {
    if (actionComment.trim()) {
      onRequestMoreInfo(actionComment);
      setActionComment('');
      setShowInfoRequestDialog(false);
    }
  };

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveTypeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[color] || colorMap['blue'];
  };

  return (
    <div className="space-y-6">
      {/* Request Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
            <Badge className={getLeaveTypeColor(request.leave_type.color)}>
              {request.leave_type.name}
            </Badge>
            {request.is_paid && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Paid Leave
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold">
            Leave Request from {request.employee.full_name}
          </h3>
          <p className="text-sm text-gray-600">
            Submitted on {format(new Date(request.submitted_at), 'PPP')} at {format(new Date(request.submitted_at), 'p')}
          </p>
        </div>
      </div>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Employee Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.employee.avatar_url} alt={request.employee.full_name} />
              <AvatarFallback>
                {request.employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{request.employee.full_name}</h4>
              <p className="text-sm text-gray-600">{request.employee.job_title}</p>
              <p className="text-sm text-gray-600">{request.employee.department}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{request.employee.email}</span>
            </div>
            {request.employee.phone_number && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{request.employee.phone_number}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{request.employee.department}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm">ID: {request.employee.employee_id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Leave Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Start Date</Label>
              <p className="font-medium">{format(new Date(request.start_date), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">End Date</Label>
              <p className="font-medium">{format(new Date(request.end_date), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Total Days</Label>
              <p className="font-medium">{request.total_days} day(s)</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Leave Type</Label>
              <p className="font-medium">{request.leave_type.name}</p>
            </div>
          </div>

          {request.reason && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Reason for Leave</Label>
              <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                {request.reason}
              </p>
            </div>
          )}

          {request.emergency_contact && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Emergency Contact</Label>
              <p className="mt-1 text-gray-900">{request.emergency_contact}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review History */}
      {request.reviewer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Review Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.reviewer.avatar_url} alt={request.reviewer.full_name} />
                <AvatarFallback>
                  {request.reviewer.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{request.reviewer.full_name}</h4>
                <p className="text-sm text-gray-600">{request.reviewer.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium text-gray-700">Reviewed On</Label>
                <p className="font-medium">{format(new Date(request.reviewed_at!), 'PPP')} at {format(new Date(request.reviewed_at!), 'p')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Decision</Label>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
            </div>

            {request.reviewer_comment && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-700">Reviewer Comment</Label>
                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                  {request.reviewer_comment}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approval Actions */}
      {request.status === 'pending' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Review Actions</span>
              </CardTitle>
              <CardDescription>
                Review this leave request and provide your decision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="action-comment">Review Comment (Optional)</Label>
                <Textarea
                  id="action-comment"
                  placeholder="Add your comments about this leave request..."
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setApprovalAction('approve');
                    setShowApprovalDialog(true);
                  }}
                  className="flex-1"
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Leave
                </Button>
                <Button
                  onClick={() => {
                    setApprovalAction('reject');
                    setShowRejectionDialog(true);
                  }}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Leave
                </Button>
                <Button
                  onClick={() => setShowInfoRequestDialog(true)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Request More Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approval Confirmation Dialog */}
          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Leave Request</DialogTitle>
                <DialogDescription>
                  Are you sure you want to approve this leave request? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approval-comment">Approval Comment</Label>
                  <Textarea
                    id="approval-comment"
                    placeholder="Add your approval comments..."
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setActionComment('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rejection Confirmation Dialog */}
          <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Leave Request</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this leave request? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-comment">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-comment"
                    placeholder="Please provide a reason for rejection..."
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    rows={3}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setActionComment('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading || !actionComment.trim()}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Info Request Dialog */}
          <Dialog open={showInfoRequestDialog} onOpenChange={setShowInfoRequestDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Additional Information</DialogTitle>
                <DialogDescription>
                  Request additional information from the employee before making a decision.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="info-request-comment">Information Request *</Label>
                  <Textarea
                    id="info-request-comment"
                    placeholder="What additional information do you need?"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    rows={3}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInfoRequestDialog(false);
                    setActionComment('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestMoreInfo}
                  disabled={loading || !actionComment.trim()}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default function LeaveApprovalWorkflow() {
  const { user: currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      
      // Build query based on user role
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:users!leave_requests_employee_id_fkey(*),
          leave_type:leave_types(*),
          reviewer:users!leave_requests_reviewer_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (currentUser?.user_metadata?.role === 'department-manager') {
        // Show requests from employees in the same department
        if (currentUser?.user_metadata?.department) {
          query = query.eq('employee.department', currentUser.user_metadata.department);
        }
      } else if (currentUser?.user_metadata?.role === 'hr-admin') {
        // Show all requests
        // No additional filtering needed
      } else if (currentUser?.user_metadata?.role === 'super-admin') {
        // Show all requests
        // No additional filtering needed
      } else {
        // Regular employees can only see their own requests
        query = query.eq('employee_id', currentUser?.id);
      }

      const { data, error } = await query;

      if (data) {
        setLeaveRequests(data);
      } else if (error) {
        console.error('Error loading leave requests:', error);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, comment: string) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          reviewer_id: currentUser?.id,
          reviewer_comment: comment,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select(`
          *,
          employee:users!leave_requests_employee_id_fkey(*),
          leave_type:leave_types(*),
          reviewer:users!leave_requests_reviewer_id_fkey(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setLeaveRequests(prev => 
          prev.map(req => req.id === requestId ? data : req)
        );
        
        // Update leave balance
        await updateLeaveBalance(data.employee_id, data.leave_type_id, data.total_days, 'subtract');
        
        // Send notification
        await sendNotification(data.employee_id, 'leave_approved', {
          leave_request_id: data.id,
          comment: comment,
        });

        if (selectedRequest?.id === requestId) {
          setSelectedRequest(data);
        }
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  const handleReject = async (requestId: string, comment: string) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          reviewer_id: currentUser?.id,
          reviewer_comment: comment,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select(`
          *,
          employee:users!leave_requests_employee_id_fkey(*),
          leave_type:leave_types(*),
          reviewer:users!leave_requests_reviewer_id_fkey(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setLeaveRequests(prev => 
          prev.map(req => req.id === requestId ? data : req)
        );
        
        // Send notification
        await sendNotification(data.employee_id, 'leave_rejected', {
          leave_request_id: data.id,
          comment: comment,
        });

        if (selectedRequest?.id === requestId) {
          setSelectedRequest(data);
        }
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    }
  };

  const handleRequestMoreInfo = async (requestId: string, comment: string) => {
    try {
      // Send notification requesting more information
      await sendNotification(requestId, 'leave_info_request', {
        comment: comment,
        requester_id: currentUser?.id,
      });
    } catch (error) {
      console.error('Error requesting more info:', error);
    }
  };

  const updateLeaveBalance = async (employeeId: string, leaveTypeId: string, days: number, action: 'add' | 'subtract') => {
    try {
      const { data: balance, error: balanceError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('leave_type_id', leaveTypeId)
        .single();

      if (balance && !balanceError) {
        const newBalance = action === 'add' 
          ? balance.available_days + days
          : balance.available_days - days;

        await supabase
          .from('leave_balances')
          .update({
            available_days: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', balance.id);
      }
    } catch (error) {
      console.error('Error updating leave balance:', error);
    }
  };

type NotificationData = {
  leave_request_id?: string;
  comment?: string;
  requester_id?: string;
};

  const sendNotification = async (recipientId: string, type: string, data: NotificationData) => {
    try {
      await supabase.from('notifications').insert({
        recipient_id: recipientId,
        sender_id: currentUser?.id,
        type: type,
        data: data,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || request.employee.department === departmentFilter;
    return matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveTypeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[color] || colorMap['blue'];
  };

  const departments = [...new Set(leaveRequests.map(req => req.employee.department))].sort();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Approval Workflow</CardTitle>
          <CardDescription>Loading leave requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leave Approval Workflow</h2>
          <p className="text-gray-600">
            Review and approve leave requests from your team
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLeaveRequests}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{leaveRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="department-filter">Department:</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Review and manage leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.employee.avatar_url} alt={request.employee.full_name} />
                          <AvatarFallback>
                            {request.employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.employee.full_name}</div>
                          <div className="text-sm text-gray-500">{request.employee.job_title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLeaveTypeColor(request.leave_type.color)}>
                        {request.leave_type.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(request.start_date), 'MMM d, yyyy')}</div>
                        <div className="text-gray-500">to {format(new Date(request.end_date), 'MMM d, yyyy')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{request.total_days}</div>
                        <div className="text-xs text-gray-500">days</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.employee.department}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(request.submitted_at), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(request.submitted_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' || departmentFilter !== 'all'
                  ? "Try adjusting your filter criteria."
                  : "No leave requests to review at this time."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review the leave request and provide your decision
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <LeaveRequestDetails
              request={selectedRequest}
              onApprove={(comment) => handleApprove(selectedRequest.id, comment)}
              onReject={(comment) => handleReject(selectedRequest.id, comment)}
              onRequestMoreInfo={(comment) => handleRequestMoreInfo(selectedRequest.id, comment)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}