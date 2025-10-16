'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Leave, LeaveStatus, LeaveType } from '@/types';

interface LeaveRequestListProps {
  leaves: Leave[];
  leaveTypes: LeaveType[];
  isManager?: boolean;
}

export function LeaveRequestList({ leaves, leaveTypes, isManager = false }: LeaveRequestListProps) {
  const router = useRouter();
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>(leaves);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getStatusBadgeVariant = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, typeFilter);
  };

  const handleStatusFilter = (status: LeaveStatus | 'all') => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, typeFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    applyFilters(searchQuery, statusFilter, type);
  };

  const applyFilters = (query: string, status: LeaveStatus | 'all', type: string) => {
    let filtered = [...leaves];

    // Apply search query filter
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter((leave) => {
        const requesterName = `${leave.requester?.first_name ?? ''} ${leave.requester?.last_name ?? ''}`.trim().toLowerCase();
        const leaveTypeName = leave.leave_type?.name?.toLowerCase() ?? '';
        const reason = leave.reason?.toLowerCase() ?? '';
        return (
          requesterName.includes(lowercaseQuery) ||
          leaveTypeName.includes(lowercaseQuery) ||
          reason.includes(lowercaseQuery)
        );
      });
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter((leave) => leave.status === status);
    }

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter((leave) => leave.leave_type_id === type);
    }

    setFilteredLeaves(filtered);
  };

  const handleRowClick = (leaveId: string) => {
    router.push(`/dashboard/leaves/${leaveId}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle>Leave Requests</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => router.push('/dashboard/leaves/new')}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>New Request</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(value) => handleStatusFilter(value as LeaveStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => handleTypeFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                {isManager && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 7 : 6} className="text-center py-6 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow 
                    key={leave.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(leave.id)}
                  >
                    <TableCell>
                      {(() => {
                        const first = leave.requester?.first_name ?? '';
                        const last = leave.requester?.last_name ?? '';
                        const full = `${first} ${last}`.trim();
                        return full || 'Unknown';
                      })()}
                    </TableCell>
                    <TableCell>{leave.leave_type?.name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(leave.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(leave.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{leave.days_count}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </TableCell>
                    {isManager && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/leaves/${leave.id}/approve`);
                              }}
                            >
                              Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}