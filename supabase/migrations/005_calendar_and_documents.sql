-- Calendar and Document Management System Tables

-- Migration: 005_calendar_and_documents.sql
-- Description: Add tables for calendar events, document management, and reporting

-- Calendar Events Table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('leave', 'holiday', 'meeting', 'deadline', 'custom')),
  leave_request_id UUID REFERENCES leaves(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_all_day BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#3b82f6',
  location VARCHAR(255),
  reminder_minutes INTEGER DEFAULT 0,
  created_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for calendar events
CREATE INDEX idx_calendar_events_employee ON calendar_events(employee_id);
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_leave_request ON calendar_events(leave_request_id);
CREATE INDEX idx_calendar_events_active ON calendar_events(is_active);

-- Document Categories Table
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  allowed_extensions TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
  max_file_size_mb INTEGER DEFAULT 10,
  requires_approval BOOLEAN DEFAULT false,
  retention_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default document categories
INSERT INTO document_categories (name, description, allowed_extensions, max_file_size_mb, retention_days) VALUES
('Leave Documents', 'Documents related to leave requests', ARRAY['pdf', 'png', 'jpg', 'jpeg'], 5, 2555),
('Policy Documents', 'Company policies and procedures', ARRAY['pdf', 'doc', 'docx'], 10, 3650),
('Training Documents', 'Training materials and certificates', ARRAY['pdf', 'png', 'jpg', 'jpeg'], 10, 1825),
('Expense Documents', 'Expense reports and receipts', ARRAY['pdf', 'png', 'jpg', 'jpeg', 'xls', 'xlsx'], 10, 1095),
('Personal Documents', 'Employee personal documents', ARRAY['pdf', 'png', 'jpg', 'jpeg'], 5, 2555);

-- Enhanced Documents Table with Metadata
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES document_categories(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_request_id UUID REFERENCES leaves(id) ON DELETE CASCADE,
  expiry_date DATE,
  version INTEGER DEFAULT 1,
  is_current_version BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_encrypted BOOLEAN DEFAULT false,
  checksum VARCHAR(64),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for documents
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);
CREATE INDEX idx_documents_active ON documents(is_active);
CREATE INDEX idx_documents_leave_request ON documents(leave_request_id);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Document Sharing Table
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES employees(id) ON DELETE CASCADE,
  permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'download', 'edit')),
  expires_at TIMESTAMPTZ,
  access_token VARCHAR(64) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for document shares
CREATE INDEX idx_document_shares_document ON document_shares(document_id);
CREATE INDEX idx_document_shares_shared_with ON document_shares(shared_with);
CREATE INDEX idx_document_shares_active ON document_shares(is_active);
CREATE INDEX idx_document_shares_token ON document_shares(access_token);

-- Document Audit Log
CREATE TABLE document_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('upload', 'download', 'view', 'share', 'unshare', 'delete', 'restore', 'update')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for document audit logs
CREATE INDEX idx_document_audit_document ON document_audit_logs(document_id);
CREATE INDEX idx_document_audit_employee ON document_audit_logs(employee_id);
CREATE INDEX idx_document_audit_action ON document_audit_logs(action);
CREATE INDEX idx_document_audit_created ON document_audit_logs(created_at);

-- Reporting Views and Tables
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  query_template TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  output_format VARCHAR(20) DEFAULT 'json' CHECK (output_format IN ('json', 'csv', 'excel', 'pdf')),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report Execution Log
CREATE TABLE report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  parameters JSONB DEFAULT '{}'::jsonb,
  execution_time_ms INTEGER,
  row_count INTEGER,
  file_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for report executions
CREATE INDEX idx_report_executions_template ON report_executions(template_id);
CREATE INDEX idx_report_executions_executed_by ON report_executions(executed_by);
CREATE INDEX idx_report_executions_status ON report_executions(status);
CREATE INDEX idx_report_executions_created ON report_executions(created_at);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('leave_approved', 'leave_rejected', 'leave_pending', 'document_expiry', 'calendar_reminder', 'report_ready')),
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, notification_type)
);

-- Indexes for notification preferences
CREATE INDEX idx_notification_preferences_employee ON notification_preferences(employee_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON document_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_shares_updated_at BEFORE UPDATE ON document_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();