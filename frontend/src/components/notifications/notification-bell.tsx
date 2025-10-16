'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { notificationService, type Notification } from '@/lib/services/notification-service';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'leave_request':
        return '📅';
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      case 'leave_cancelled':
        return '🚫';
      case 'system':
        return '🔔';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'leave_request':
        return 'bg-primary/20 text-primary';
      case 'leave_approved':
        return 'bg-success/20 text-success';
      case 'leave_rejected':
        return 'bg-destructive/20 text-destructive';
      case 'leave_cancelled':
        return 'bg-muted text-muted-foreground';
      case 'system':
        return 'bg-secondary/20 text-secondary';
      case 'reminder':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={cn(
      "p-4 hover:bg-accent/50 transition-colors",
      !notification.read && "bg-primary/10 border-l-4 border-primary"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
            getNotificationColor(notification.type)
          )}>
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    loadUnreadCount();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribe((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { notifications } = await notificationService.getNotifications(user.id, { limit: 20 });
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        return deletedNotification && !deletedNotification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-gray-500">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-gray-500">No notifications</div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setOpen(false)}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}