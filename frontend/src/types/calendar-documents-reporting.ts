// Calendar, Documents, and Reporting Types
// This file contains TypeScript interfaces for the new database tables

import { Database } from './supabase';

// Referencing Database schema to ensure the type is used and available
export type DbPublicSchema = Database['public'];

// Calendar Types
export interface CalendarEvent {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'leave' | 'holiday' | 'meeting' | 'personal';
  leave_request_id?: string;
  is_all_day: boolean;
  color?: string;
  location?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInsert {
  employee_id?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'leave' | 'holiday' | 'meeting' | 'personal';
  leave_request_id?: string;
  is_all_day?: boolean;
  color?: string;
  location?: string;
}

export interface CalendarEventUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  event_type?: 'leave' | 'holiday' | 'meeting' | 'personal';
  leave_request_id?: string;
  is_all_day?: boolean;
  color?: string;
  location?: string;
}

// Document Types
export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  employee_id: string;
  category_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  storage_path: string;
  is_private: boolean;
  expires_at?: string;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface DocumentInsert {
  employee_id?: string;
  category_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  storage_path: string;
  is_private?: boolean;
  expires_at?: string;
}

export interface DocumentUpdate {
  category_id?: string;
  title?: string;
  description?: string;
  is_private?: boolean;
  expires_at?: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: 'view' | 'download' | 'edit';
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentShareInsert {
  document_id: string;
  shared_with: string;
  permission_level: 'view' | 'download' | 'edit';
  expires_at?: string;
}

export interface DocumentAuditLog {
  id: string;
  document_id: string;
  employee_id: string;
  action: 'viewed' | 'downloaded' | 'shared' | 'unshared' | 'updated' | 'deleted';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Reporting Types
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  report_type: 'leave_summary' | 'employee_attendance' | 'leave_balance' | 'department_analytics' | 'custom';
  query_template: string;
  parameters_schema: Record<string, unknown>;
  output_format: 'json' | 'csv' | 'excel' | 'pdf';
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplateInsert {
  name: string;
  description?: string;
  report_type: 'leave_summary' | 'employee_attendance' | 'leave_balance' | 'department_analytics' | 'custom';
  query_template: string;
  parameters_schema: Record<string, unknown>;
  output_format: 'json' | 'csv' | 'excel' | 'pdf';
  is_public?: boolean;
  is_active?: boolean;
}

export interface ReportExecution {
  id: string;
  template_id: string;
  executed_by: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result_data?: Record<string, unknown>;
  result_file_path?: string;
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ReportExecutionInsert {
  template_id: string;
  parameters: Record<string, unknown>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

// Notification Types
export interface NotificationPreference {
  id: string;
  employee_id: string;
  notification_type: 'email' | 'push' | 'sms';
  event_type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'document_expiry' | 'report_ready' | 'system_alert';
  is_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  channels: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceInsert {
  employee_id?: string;
  notification_type: 'email' | 'push' | 'sms';
  event_type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'document_expiry' | 'report_ready' | 'system_alert';
  is_enabled?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
  channels?: string[];
}

// Combined Types for API Responses
export interface CalendarEventWithEmployee extends CalendarEvent {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  leave_request?: {
    id: string;
    leave_type: string;
    status: string;
  };
}

export interface DocumentWithRelations extends Document {
  category: DocumentCategory;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  shares?: DocumentShare[];
  audit_logs?: DocumentAuditLog[];
}

export interface ReportTemplateWithExecutions extends ReportTemplate {
  executions?: ReportExecution[];
  created_by_user: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Form Data Types
export interface CalendarEventFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'leave' | 'holiday' | 'meeting' | 'personal';
  is_all_day: boolean;
  color?: string;
  location?: string;
  employee_id?: string;
}

export interface DocumentUploadFormData {
  title: string;
  description?: string;
  category_id: string;
  file: File;
  is_private: boolean;
  expires_at?: string;
}

export interface DocumentShareFormData {
  shared_with: string;
  permission_level: 'view' | 'download' | 'edit';
  expires_at?: string;
}

export interface ReportTemplateFormData {
  name: string;
  description?: string;
  report_type: 'leave_summary' | 'employee_attendance' | 'leave_balance' | 'department_analytics' | 'custom';
  query_template: string;
  parameters_schema: Record<string, unknown>;
  output_format: 'json' | 'csv' | 'excel' | 'pdf';
  is_public: boolean;
}

// Search and Filter Types
export interface CalendarEventFilters {
  employee_id?: string;
  event_type?: ('leave' | 'holiday' | 'meeting' | 'personal')[];
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

export interface DocumentFilters {
  employee_id?: string;
  category_id?: string;
  search_term?: string;
  is_private?: boolean;
  has_expired?: boolean;
  uploaded_after?: string;
  uploaded_before?: string;
}

export interface ReportFilters {
  template_id?: string;
  executed_by?: string;
  status?: ('pending' | 'running' | 'completed' | 'failed')[];
  executed_after?: string;
  executed_before?: string;
}

// Calendar View Types
export interface CalendarViewOptions {
  view: 'month' | 'week' | 'day' | 'list';
  date: string;
  employee_id?: string;
  department_id?: string;
  show_leave_events: boolean;
  show_holidays: boolean;
  show_personal_events: boolean;
  show_meetings: boolean;
}