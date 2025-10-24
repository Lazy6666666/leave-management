'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check, 
  Trash2, 
  Settings,
  Mail,
  Smartphone,
  Calendar,
  User,
  Clock,
  X
} from 'lucide-react';
import { notificationService, type Notification } from '@/lib/services/notification-service';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'leave_request':
        return <Calendar className="h-4 w-4" />;
      case 'leave_approved':
        return <Check className="h-4 w-4" />;
      case 'leave_rejected':
        return <X className="h-4 w-4" />;
      case 'leave_cancelled':
        return <X className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'leave_request':
        return 'bg-primary/20 text-primary';
      case 'leave_approved':
        return 'bg-success/20 text-success';
      case 'leave_rejected':
        return 'bg-destructive/20 text-destructive';
      case 'leave_cancelled':
        return 'bg-warning/20 text-warning';
      case 'system':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'bg-destructive';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div
      className={cn(
        "group relative p-4 border-b last:border-b-0 transition-colors",
        notification.read 
          ? "bg-card hover:bg-accent/50" 
          : "bg-primary/10 hover:bg-primary/20 border-l-4 border-l-primary"
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          getNotificationColor()
        )}>
          {getNotificationIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs px-1 py-0", getPriorityColor())}
                >
                  {notification.priority}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                </div>
                {notification.relatedEntityId && (
                  <span className="text-blue-600">View Details</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    inApp: true,
    leaveRequests: true,
    leaveApprovals: true,
    systemUpdates: true,
    weeklyDigest: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSettingChange = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (user) {
      try {
        setSaving(true);
        await notificationService.updateNotificationPreferences(user.id, {
          ...settings,
          [key]: value
        });
      } catch (error) {
        console.error('Error updating notification preferences:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Notification Channels</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email}
                onCheckedChange={(checked) => handleSettingChange('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-600" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.push}
                onCheckedChange={(checked) => handleSettingChange('push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-600" />
                <Label htmlFor="inapp-notifications">In-App Notifications</Label>
              </div>
              <Switch
                id="inapp-notifications"
                checked={settings.inApp}
                onCheckedChange={(checked) => handleSettingChange('inApp', checked)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-requests">Leave Requests</Label>
              <Switch
                id="leave-requests"
                checked={settings.leaveRequests}
                onCheckedChange={(checked) => handleSettingChange('leaveRequests', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-approvals">Leave Approvals</Label>
              <Switch
                id="leave-approvals"
                checked={settings.leaveApprovals}
                onCheckedChange={(checked) => handleSettingChange('leaveApprovals', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-updates">System Updates</Label>
              <Switch
                id="system-updates"
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <Switch
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {saving && (
        <div className="text-sm text-blue-600">Saving preferences...</div>
      )}
    </div>
  );
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Set up real-time subscription
      const subscription = notificationService.subscribeToNotifications(
        user.id,
        (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userNotifications = await notificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!user) return;

    try {
      await notificationService.clearAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const notificationTypes = [...new Set(notifications.map(n => n.type))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading your notifications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
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
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>
                  Customize how you receive notifications
                </DialogDescription>
              </DialogHeader>
              <NotificationSettings />
            </DialogContent>
          </Dialog>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Filter:</Label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Type:</Label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Types</option>
            {notificationTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                {filter === 'all' && typeFilter === 'all' 
                  ? "You're all caught up!" 
                  : "Try adjusting your filters."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}