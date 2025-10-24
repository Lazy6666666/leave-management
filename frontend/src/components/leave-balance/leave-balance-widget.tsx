'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Info 
} from 'lucide-react';
import { leaveBalanceService, type LeaveBalance } from '@/lib/services/leave-balance-service';
import { useAuth } from '@/lib/auth/auth-context';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  onRefresh: () => void;
}

function LeaveBalanceCard({ balance, onRefresh }: LeaveBalanceCardProps) {
  const usagePercentage = balance.totalDays > 0 ? (balance.usedDays / balance.totalDays) * 100 : 0;
  const remainingPercentage = balance.totalDays > 0 ? (balance.remainingDays / balance.totalDays) * 100 : 0;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusBadge = () => {
    if (balance.remainingDays === 0) {
      return <Badge variant="destructive">No Balance</Badge>;
    }
    if (usagePercentage >= 90) {
      return <Badge variant="destructive">Low Balance</Badge>;
    }
    if (usagePercentage >= 75) {
      return <Badge variant="secondary">Moderate</Badge>;
    }
    return <Badge variant="default">Good</Badge>;
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      usagePercentage >= 90 && "border-destructive/20 bg-destructive/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: balance.leaveTypeColor || '#6B7280' }}
            />
            <CardTitle className="text-lg">{balance.leaveTypeName}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Leave balance for {balance.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Usage</span>
              <span>{balance.usedDays} / {balance.totalDays} days</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={cn(
                "h-2",
                usagePercentage >= 90 && "bg-red-200",
                usagePercentage >= 75 && usagePercentage < 90 && "bg-yellow-200"
              )}
            />
          </div>

          {/* Balance Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success">{balance.remainingDays}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{balance.usedDays}</div>
            <div className="text-xs text-muted-foreground">Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{balance.totalDays}</div>
            <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Carry Forward Info */}
          {balance.carryForwardDays && balance.carryForwardDays > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                {balance.carryForwardDays} days carried forward from previous year
              </span>
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Last updated: {format(balance.lastUpdated, 'MMM d, yyyy')}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LeaveBalanceSummaryProps {
  balances: LeaveBalance[];
}

function LeaveBalanceSummary({ balances }: LeaveBalanceSummaryProps) {
  const totalDays = balances.reduce((sum, b) => sum + b.totalDays, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.usedDays, 0);
  const totalRemaining = balances.reduce((sum, b) => sum + b.remainingDays, 0);
  const overallUsage = totalDays > 0 ? (totalUsed / totalDays) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">Overall Leave Summary</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Combined leave balance across all leave types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalRemaining}</div>
              <div className="text-sm text-gray-600">Days Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalUsed}</div>
              <div className="text-sm text-gray-600">Days Used</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{totalDays}</div>
              <div className="text-sm text-gray-600">Total Allocation</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Usage</span>
              <span>{overallUsage.toFixed(1)}%</span>
            </div>
            <Progress value={overallUsage} className="h-3" />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              Current year: {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeaveBalanceWidget() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadLeaveBalances();
    }
  }, [user, selectedYear]);

  const loadLeaveBalances = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const employeeId = user.id;
      const balances = await leaveBalanceService.getEmployeeLeaveBalance(employeeId, selectedYear);
      setBalances(balances);
    } catch (error) {
      console.error('Error loading leave balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaveBalances();
    setRefreshing(false);
  };

  const getLowBalanceWarning = () => {
    const lowBalances = balances.filter(b => b.remainingDays <= 5 && b.remainingDays > 0);
    if (lowBalances.length === 0) return null;

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Low Leave Balance Warning</h3>
            <p className="text-sm text-yellow-700 mt-1">
              You have low leave balance for: {lowBalances.map(b => b.leaveTypeName).join(', ')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
          <CardDescription>Loading your leave balance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leave Balance</h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Low Balance Warning */}
      {getLowBalanceWarning()}

      {/* Summary Card */}
      <LeaveBalanceSummary balances={balances} />

      {/* Individual Leave Type Balances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => (
          <LeaveBalanceCard
            key={balance.id}
            balance={balance}
            onRefresh={handleRefresh}
          />
        ))}
      </div>

      {/* Empty State */}
      {balances.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Balance Found</h3>
            <p className="text-gray-600 mb-4">
              You don&apos;t have any leave balance allocated for {selectedYear}.
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}