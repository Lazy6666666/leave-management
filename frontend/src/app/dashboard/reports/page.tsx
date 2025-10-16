'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportingDashboard } from '@/components/reports/reporting-dashboard';
import { PieChart } from '@/components/reports/pie-chart';
import { LineChart } from '@/components/reports/line-chart';
import { BarChart } from '@/components/reports/bar-chart';
import { ReportExportDialog } from '@/components/reports/report-export-dialog';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

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
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'), // Start of year
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [department, setDepartment] = useState('all');
  const [leaveType, setLeaveType] = useState('all');
  const [departments, setDepartments] = useState<Array<{id: string; name: string}>>([]);
  const [leaveTypes, setLeaveTypes] = useState<Array<{id: string; name: string}>>([]);
  
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [leaveByType, setLeaveByType] = useState<LeaveByType[]>([]);
  const [leaveByDepartment, setLeaveByDepartment] = useState<LeaveByDepartment[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch reports data when filters change
  useEffect(() => {
    fetchReportsData();
  }, [dateRange, department, leaveType]);

  const fetchFilterOptions = async () => {
    try {
      const [deptsResponse, typesResponse] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/leave-types'),
      ]);

      if (deptsResponse.ok) {
        const deptsData = await deptsResponse.json();
        setDepartments(deptsData.data || []);
      }

      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setLeaveTypes(typesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        ...(department !== 'all' && { department }),
        ...(leaveType !== 'all' && { leave_type: leaveType }),
      });

      const [statsResponse, byTypeResponse, byDeptResponse, trendsResponse] = await Promise.all([
        fetch(`/api/reports/leave-stats?${params}`),
        fetch(`/api/reports/leave-by-type?${params}`),
        fetch(`/api/reports/leave-by-department?${params}`),
        fetch(`/api/reports/monthly-trends?${params}`),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setLeaveStats(statsData.data);
      }

      if (byTypeResponse.ok) {
        const byTypeData = await byTypeResponse.json();
        setLeaveByType(byTypeData.data);
      }

      if (byDeptResponse.ok) {
        const byDeptData = await byDeptResponse.json();
        setLeaveByDepartment(byDeptData.data);
      }

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setMonthlyTrends(trendsData.data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Report Type', 'Metric', 'Value'],
      ['Leave Statistics', 'Total Requests', leaveStats?.totalRequests?.toString() || '0'],
      ['Leave Statistics', 'Approved Requests', leaveStats?.approvedRequests?.toString() || '0'],
      ['Leave Statistics', 'Pending Requests', leaveStats?.pendingRequests?.toString() || '0'],
      ['Leave Statistics', 'Rejected Requests', leaveStats?.rejectedRequests?.toString() || '0'],
      ['Leave Statistics', 'Utilization Rate', `${leaveStats?.utilizationRate?.toFixed(2)}%` || '0%'],
      ['Leave Statistics', 'Avg Processing Time', `${leaveStats?.averageProcessingTime?.toFixed(1)} days` || '0 days'],
      ...leaveByType.map(item => ['Leave by Type', item.leave_type, item.count.toString()]),
      ...leaveByDepartment.map(item => ['Leave by Department', item.department, item.requests.toString()]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <ReportExportDialog 
          reportType="comprehensive" 
          filters={{
            dateFrom: dateRange.startDate,
            dateTo: dateRange.endDate,
            departmentId: department,
            leaveTypeId: leaveType
          }}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leave-type">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger id="leave-type">
                  <SelectValue placeholder="All Leave Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <ReportingDashboard />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave by Type */}
        <PieChart
          data={leaveByType.map(item => ({
            label: item.leave_type,
            value: item.count,
          }))}
          title="Leave Requests by Type"
        />

        {/* Monthly Trends */}
        <LineChart
          data={monthlyTrends.map(item => ({
            label: item.month,
            value: item.requests,
          }))}
          title="Monthly Leave Trends"
          xAxisLabel="Month"
          yAxisLabel="Number of Requests"
        />

        {/* Department Analysis */}
        <BarChart
          data={leaveByDepartment.map(item => ({
            label: item.department,
            value: item.requests,
          }))}
          title="Leave Requests by Department"
          xAxisLabel="Department"
          yAxisLabel="Number of Requests"
        />

        {/* Approval Rate by Department */}
        <BarChart
          data={leaveByDepartment.map(item => ({
            label: item.department,
            value: Math.round(item.utilization),
          }))}
          title="Approval Rate by Department (%)"
          xAxisLabel="Department"
          yAxisLabel="Approval Rate (%)"
        />
      </div>
    </div>
  );
}