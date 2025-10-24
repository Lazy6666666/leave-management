import { createClient } from '@/lib/supabase/server';
import { format, addDays, subDays } from 'date-fns';

interface DocumentExpiryNotification {
  document_id: string;
  document_title: string;
  expiry_date: string;
  employee_id: string;
  employee_email: string;
  employee_name: string;
  days_until_expiry: number;
}

export async function checkDocumentExpirations() {
  try {
    const supabase = createClient();
    
    // Get documents expiring in the next 30 days
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const fiveDaysFromNow = addDays(today, 5);

    // Fetch documents with expiry dates
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        employees!inner(id, email, first_name, last_name)
      `)
      .not('expiry_date', 'is', null)
      .gte('expiry_date', format(today, 'yyyy-MM-dd'))
      .lte('expiry_date', format(thirtyDaysFromNow, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching expiring documents:', error);
      return [];
    }

    const notifications: DocumentExpiryNotification[] = [];
    
    for (const document of documents || []) {
      const expiryDate = new Date(document.expiry_date);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send notifications for 30, 14, 7, 5, 3, 1 days before expiry
      const notificationDays = [30, 14, 7, 5, 3, 1];
      
      if (notificationDays.includes(daysUntilExpiry)) {
        notifications.push({
          document_id: document.id,
          document_title: document.title,
          expiry_date: document.expiry_date,
          employee_id: document.employees.id,
          employee_email: document.employees.email,
          employee_name: `${document.employees.first_name} ${document.employees.last_name}`,
          days_until_expiry: daysUntilExpiry,
        });

        // Create notification record in database
        await createNotificationRecord({
          employee_id: document.employees.id,
          document_id: document.id,
          notification_type: 'document_expiry',
          message: `Document "${document.title}" expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
          is_read: false,
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error in checkDocumentExpirations:', error);
    return [];
  }
}

export async function createNotificationRecord(notification: {
  employee_id: string;
  document_id?: string;
  notification_type: string;
  message: string;
  is_read: boolean;
}) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating notification record:', error);
    }
  } catch (error) {
    console.error('Error in createNotificationRecord:', error);
  }
}

export async function getEmployeeNotifications(employeeId: string) {
  try {
    const supabase = createClient();
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return notifications || [];
  } catch (error) {
    console.error('Error in getEmployeeNotifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
  }
}