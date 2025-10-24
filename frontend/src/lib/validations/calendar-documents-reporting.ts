// Validation schemas for Calendar, Documents, and Reporting features
import { z } from 'zod';

// Calendar Event Validation Schemas
export const calendarEventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  event_type: z.enum(['leave', 'holiday', 'meeting', 'personal']),
  is_all_day: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  employee_id: z.string().uuid().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export const calendarEventUpdateSchema = calendarEventFormSchema.partial();

export const calendarEventFiltersSchema = z.object({
  employee_id: z.string().uuid().optional(),
  event_type: z.array(z.enum(['leave', 'holiday', 'meeting', 'personal'])).optional(),
  start_date_from: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date from',
  }).optional(),
  start_date_to: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date to',
  }).optional(),
  end_date_from: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date from',
  }).optional(),
  end_date_to: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date to',
  }).optional(),
});

// Document Validation Schemas
export const documentUploadFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  category_id: z.string().uuid('Invalid category ID'),
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, {
    message: 'File size must be less than 10MB',
  }).refine((file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];
    return allowedTypes.includes(file.type);
  }, {
    message: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT',
  }),
  is_private: z.boolean().default(false),
  expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid expiry date',
  }).optional(),
}).refine((data) => {
  if (data.expires_at) {
    return new Date(data.expires_at) > new Date();
  }
  return true;
}, {
  message: 'Expiry date must be in the future',
  path: ['expires_at'],
});

export const documentUpdateSchema = z.object({
  category_id: z.string().uuid('Invalid category ID').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  is_private: z.boolean().optional(),
  expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid expiry date',
  }).optional(),
}).refine((data) => {
  if (data.expires_at) {
    return new Date(data.expires_at) > new Date();
  }
  return true;
}, {
  message: 'Expiry date must be in the future',
  path: ['expires_at'],
});

export const documentShareFormSchema = z.object({
  shared_with: z.string().uuid('Invalid employee ID'),
  permission_level: z.enum(['view', 'download', 'edit']),
  expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid expiry date',
  }).optional(),
}).refine((data) => {
  if (data.expires_at) {
    return new Date(data.expires_at) > new Date();
  }
  return true;
}, {
  message: 'Share expiry date must be in the future',
  path: ['expires_at'],
});

export const documentFiltersSchema = z.object({
  employee_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  search_term: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  is_private: z.boolean().optional(),
  has_expired: z.boolean().optional(),
  uploaded_after: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid upload date',
  }).optional(),
  uploaded_before: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid upload date',
  }).optional(),
});

// Report Validation Schemas
export const reportTemplateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  report_type: z.enum(['leave_summary', 'employee_attendance', 'leave_balance', 'department_analytics', 'custom']),
  query_template: z.string().min(1, 'Query template is required'),
  parameters_schema: z.object({}).passthrough(),
  output_format: z.enum(['json', 'csv', 'excel', 'pdf']),
  is_public: z.boolean().default(false),
});

export const reportTemplateUpdateSchema = reportTemplateFormSchema.partial();

export const reportExecutionSchema = z.object({
  template_id: z.string().uuid('Invalid template ID'),
  parameters: z.object({}).passthrough(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
});

export const reportFiltersSchema = z.object({
  template_id: z.string().uuid().optional(),
  executed_by: z.string().uuid().optional(),
  status: z.array(z.enum(['pending', 'running', 'completed', 'failed'])).optional(),
  executed_after: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid execution date',
  }).optional(),
  executed_before: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid execution date',
  }).optional(),
});

// Notification Validation Schemas
export const notificationPreferenceSchema = z.object({
  notification_type: z.enum(['email', 'push', 'sms']),
  event_type: z.enum(['leave_request', 'leave_approved', 'leave_rejected', 'document_expiry', 'report_ready', 'system_alert']),
  is_enabled: z.boolean().default(true),
  frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']).default('immediate'),
  channels: z.array(z.string()).default([]),
});

export const notificationPreferenceUpdateSchema = notificationPreferenceSchema.partial();

// Calendar View Options Schema
export const calendarViewOptionsSchema = z.object({
  view: z.enum(['month', 'week', 'day', 'list']).default('month'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }).default(() => new Date().toISOString()),
  employee_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  show_leave_events: z.boolean().default(true),
  show_holidays: z.boolean().default(true),
  show_personal_events: z.boolean().default(true),
  show_meetings: z.boolean().default(true),
});

// File Upload Validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, {
    message: 'File size must be less than 10MB',
  }),
  category_id: z.string().uuid('Invalid category ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  is_private: z.boolean().default(false),
  expires_at: z.string().optional(),
});

// Search and Filter Validation
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  type: z.enum(['documents', 'calendar', 'reports', 'all']).default('all'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Export Validation Schemas
export const exportDataSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  data_type: z.enum(['calendar_events', 'documents', 'leave_requests', 'employees', 'reports']),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  filters: z.object({}).passthrough().optional(),
});

// Error Response Schemas
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(validationErrorSchema).optional(),
  timestamp: z.string(),
});