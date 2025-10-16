'use client';

import { useState, useEffect } from 'react';
import { TeamCalendar } from '@/components/calendar/team-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { calendarService, LeaveEvent, Department, LeaveType } from '@/lib/services/calendar-service';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/auth/permission-gate';
import { useAuth } from '@/components/auth/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import type { UserRole } from '@/types';

export default function CalendarPage() {
  const { employee } = useAuth();
  const userRole: UserRole = employee?.role ?? 'employee';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: departments = [] as Department[] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => calendarService.getDepartments(),
  });

  const { data: leaveTypes = [] as LeaveType[] } = useQuery({
    queryKey: ['leave_types'],
    queryFn: () => calendarService.getLeaveTypes(),
  });

  const { data: leaves = [] as LeaveEvent[], isLoading } = useQuery({
    queryKey: ['calendar_leaves', currentMonth, selectedDepartment, selectedLeaveType, selectedStatus],
    queryFn: () => calendarService.getLeaveEvents({
      month: currentMonth,
      departmentId: selectedDepartment,
      leaveTypeId: selectedLeaveType,
      status: selectedStatus,
    }),
  });

  const handleExportCalendar = () => {
    // TODO: Implement calendar export functionality
    console.log('Export calendar functionality to be implemented');
  };

  const handlePrintCalendar = () => {
    window.print();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <ProtectedRoute>
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Calendar</h1>
          <p className="text-muted-foreground">
            View and manage team leave schedules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-32 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrintCalendar}>
            <Calendar className="h-4 w-4 mr-2" />
            Print
          </Button>
          <PermissionGate userRole={userRole} permission="reports.export" fallback={null}>
            <Button variant="outline" size="sm" onClick={handleExportCalendar}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Leave Type</label>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <PermissionGate userRole={userRole} permission="reports.view" fallback={null}>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </PermissionGate>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <TeamCalendar
            leaves={leaves}
            selectedDate={selectedDate || undefined}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
          />
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Upcoming Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaves.length > 0 ? (
                  leaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: leave.color }}
                        />
                        <div>
                          <p className="font-medium">{leave.employeeName}</p>
                          <p className="text-sm text-gray-600">{leave.leaveType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {format(leave.startDate, 'MMM d')} - {format(leave.endDate, 'MMM d')}
                        </p>
                        <Badge className={cn(
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {leave.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No leaves found for the selected filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaves.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaves.filter(l => l.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((leaves.filter(l => l.status === 'approved').length / leaves.length) * 100) || 0}% approval rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaves.filter(l => l.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  );
}