'use client';

import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  FileText,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format as formatDate, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface LeaveStats {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  utilizationRate: number;
  averageProcessingTime: number;
}

interface LeaveByType {
  leave_type: string;
  count: number;
  percentage: number;
}

interface LeaveByDepartment {
  department: string;
  requests: number;
  approved: number;
  utilization: number;
}

interface MonthlyTrend {
  month: string;
  requests: number;
  approved: number;
  rejected: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function ReportingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['leave-stats', dateRange, selectedDepartment, selectedLeaveType],
    queryFn: async () => {
      const start = dateRange?.from ?? startOfMonth(new Date());
      const end = dateRange?.to ?? endOfMonth(new Date());
      const params = new URLSearchParams({
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        department: selectedDepartment,
        leave_type: selectedLeaveType,
      });

      const response = await fetch(`/api/reports/leave-stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave statistics');
      }
      const { data } = await response.json();
      return data as LeaveStats;
    },
  });

  const { data: leaveByType = [], isLoading: typeLoading } = useQuery({
    queryKey: ['leave-by-type', dateRange, selectedDepartment],
    queryFn: async () => {
      const start = dateRange?.from ?? startOfMonth(new Date());
      const end = dateRange?.to ?? endOfMonth(new Date());
      const params = new URLSearchParams({
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        department: selectedDepartment,
      });

      const response = await fetch(`/api/reports/leave-by-type?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave by type data');
      }
      const { data } = await response.json();
      return data as LeaveByType[];
    },
  });

  const { data: leaveByDepartment = [], isLoading: deptLoading } = useQuery({
    queryKey: ['leave-by-department', dateRange, selectedLeaveType],
    queryFn: async () => {
      const start = dateRange?.from ?? startOfMonth(new Date());
      const end = dateRange?.to ?? endOfMonth(new Date());
      const params = new URLSearchParams({
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        leave_type: selectedLeaveType,
      });

      const response = await fetch(`/api/reports/leave-by-department?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave by department data');
      }
      const { data } = await response.json();
      return data as LeaveByDepartment[];
    },
  });

  const { data: monthlyTrend = [], isLoading: trendLoading } = useQuery({
    queryKey: ['monthly-trend', dateRange, selectedDepartment, selectedLeaveType],
    queryFn: async () => {
      const start = dateRange?.from ?? startOfMonth(new Date());
      const end = dateRange?.to ?? endOfMonth(new Date());
      const params = new URLSearchParams({
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        department: selectedDepartment,
        leave_type: selectedLeaveType,
      });

      const response = await fetch(`/api/reports/monthly-trend?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly trend data');
      }
      const { data } = await response.json();
      return data as MonthlyTrend[];
    },
  });

  const handleExport = async (fileFormat: 'csv' | 'excel' | 'pdf') => {
    try {
      const start = dateRange?.from ?? startOfMonth(new Date());
      const end = dateRange?.to ?? endOfMonth(new Date());
      const params = new URLSearchParams({
        format: fileFormat,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        department: selectedDepartment,
        leave_type: selectedLeaveType,
      });

      const response = await fetch(`/api/reports/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export successful', {
        description: `Report exported as ${fileFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Export failed', {
        description: 'Failed to export the report',
      });
    }
  };

  const handleRefresh = () => {
    // This will trigger refetch of all queries
    window.location.reload();
  };

  const isLoading = statsLoading || typeLoading || deptLoading || trendLoading;

  // Normalize leaveByType data for Recharts Pie labels
  const leaveByTypeChartData = (leaveByType || []).map(({ leave_type, count, percentage }) => ({
    name: leave_type,
    count,
    percentage,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management Reports</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your report view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date Range</Label>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Leave Type</Label>
              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Leave Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedRequests || 0}</div>
            <Progress value={((stats?.approvedRequests || 0) / (stats?.totalRequests || 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Avg. {stats?.averageProcessingTime || 0} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.utilizationRate || 0}%</div>
            <p className="text-xs text-muted-foreground">+5% from target</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests by Type</CardTitle>
            <CardDescription>Distribution of leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveByTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(leaveByTypeChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Leave Trends</CardTitle>
            <CardDescription>Request patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" name="Total Requests" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Department Analysis</CardTitle>
          <CardDescription>Leave utilization by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={leaveByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
              <Bar dataKey="approved" fill="#10b981" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}