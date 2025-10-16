import { createClient } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  userId: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  // Optional fields used by UI components
  priority?: 'low' | 'medium' | 'high';
  relatedEntityId?: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  leaveRequests: boolean;
  leaveApprovals: boolean;
  systemUpdates: boolean;
  reminders: boolean;
}

type SupabaseNotification = {
  id: string;
  user_id: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  read_at?: string;
};

class NotificationService {
  private supabase = createClient();
  private listeners: Set<(notification: Notification) => void> = new Set();

  // Subscribe to real-time notifications
  subscribe(callback: (notification: Notification) => void) {
    this.listeners.add(callback);
    
    // Set up real-time subscription
    const subscription = this.supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const notification = this.transformNotification(payload.new);
        this.listeners.forEach(listener => listener(notification));
      })
      .subscribe();

    return () => {
      this.listeners.delete(callback);
      subscription.unsubscribe();
    };
  }

  // Subscribe to notifications for a specific user (wrapper used by UI)
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const subscription = this.supabase
      .channel(`notifications_user_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        const notification = this.transformNotification(payload.new as any);
        callback(notification);
      })
      .subscribe();

    return subscription;
  }

  // Get all notifications for current user
  async getNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: Notification['type'];
  }): Promise<{ notifications: Notification[]; total: number }> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('read', false);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const notifications = (data || []).map(this.transformNotification);

      return {
        notifications,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Convenience wrapper used by UI: just get notifications list
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { notifications } = await this.getNotifications(userId);
    return notifications;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Clear all notifications for a user (used by UI)
  async clearAllNotifications(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }

  // Get notification preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Return default preferences
        return {
          email: true,
          inApp: true,
          leaveRequests: true,
          leaveApprovals: true,
          systemUpdates: true,
          reminders: true
        };
      }

      return {
        email: data.email_notifications,
        inApp: data.in_app_notifications,
        leaveRequests: data.leave_request_notifications,
        leaveApprovals: data.leave_approval_notifications,
        systemUpdates: data.system_update_notifications,
        reminders: data.reminder_notifications
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          email_notifications: preferences.email,
          in_app_notifications: preferences.inApp,
          leave_request_notifications: preferences.leaveRequests,
          leave_approval_notifications: preferences.leaveApprovals,
          system_update_notifications: preferences.systemUpdates,
          reminder_notifications: preferences.reminders,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // UI wrapper: accepts broader settings object and maps to stored preferences
  async updateNotificationPreferences(userId: string, settings: Partial<Record<string, boolean>>): Promise<void> {
    // Map UI settings to service preferences
    const mapped: Partial<NotificationPreferences> = {
      email: settings.email,
      inApp: settings.inApp ?? settings.push, // treat push as in-app notifications if provided
      leaveRequests: settings.leaveRequests,
      leaveApprovals: settings.leaveApprovals,
      systemUpdates: settings.systemUpdates,
      reminders: settings.weeklyDigest, // approximate weeklyDigest as reminders if desired
    };
    await this.updatePreferences(userId, mapped);
  }

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          read: notification.read,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformNotification(data);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send leave request notification
  async sendLeaveRequestNotification(employeeId: string, leaveRequestId: string, approverId: string): Promise<void> {
    try {
      const preferences = await this.getPreferences(approverId);
      
      if (preferences.inApp) {
        await this.createNotification({
          userId: approverId,
          type: 'leave_request',
          title: 'New Leave Request',
          message: 'You have a new leave request to review',
          data: { leaveRequestId, employeeId },
          read: false
        });
      }

      // TODO: Send email notification if enabled
    } catch (error) {
      console.error('Error sending leave request notification:', error);
      throw error;
    }
  }

  // Send leave approval notification
  async sendLeaveApprovalNotification(employeeId: string, leaveRequestId: string, status: 'approved' | 'rejected', approverName: string): Promise<void> {
    try {
      const preferences = await this.getPreferences(employeeId);
      
      if (preferences.inApp) {
        await this.createNotification({
          userId: employeeId,
          type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
          title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your leave request has been ${status} by ${approverName}`,
          data: { leaveRequestId, approverName },
          read: false
        });
      }

      // TODO: Send email notification if enabled
    } catch (error) {
      console.error('Error sending leave approval notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  private transformNotification(data: SupabaseNotification | Record<string, any>): Notification {
    return {
      id: (data as any).id,
      userId: (data as any).user_id,
      type: (data as any).type,
      title: (data as any).title,
      message: (data as any).message,
      data: (data as any).data,
      read: (data as any).read,
      createdAt: new Date((data as any).created_at),
      readAt: (data as any).read_at ? new Date((data as any).read_at) : undefined,
      priority: (data as any).priority,
      relatedEntityId: (data as any).relatedEntityId,
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;