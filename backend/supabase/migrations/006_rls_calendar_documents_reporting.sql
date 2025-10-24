-- Row Level Security Policies for Calendar, Documents, and Reporting
-- Migration: 006_rls_calendar_documents_reporting.sql
-- Description: RLS policies for calendar events, documents, and reporting tables

-- Calendar Events RLS Policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own calendar events
CREATE POLICY "Users can view own calendar events" ON calendar_events
    FOR SELECT
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE supabase_id = auth.uid() 
            AND role IN ('manager', 'admin', 'hr')
        )
    );

-- Policy: Users can create their own calendar events
CREATE POLICY "Users can create own calendar events" ON calendar_events
    FOR INSERT
    WITH CHECK (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can update their own calendar events
CREATE POLICY "Users can update own calendar events" ON calendar_events
    FOR UPDATE
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can delete their own calendar events
CREATE POLICY "Users can delete own calendar events" ON calendar_events
    FOR DELETE
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Document Categories RLS Policies
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view document categories
CREATE POLICY "All authenticated users can view document categories" ON document_categories
    FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Policy: Only managers and admins can manage document categories
CREATE POLICY "Managers and admins can manage document categories" ON document_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE supabase_id = auth.uid() 
            AND role IN ('manager', 'admin', 'hr')
        )
    );

-- Documents RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents they uploaded
CREATE POLICY "Users can view own uploaded documents" ON documents
    FOR SELECT
    USING (
        uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can view shared documents
CREATE POLICY "Users can view shared documents" ON documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM document_shares ds
            WHERE ds.document_id = documents.id
            AND ds.shared_with = (SELECT id FROM employees WHERE supabase_id = auth.uid())
            AND ds.is_active = true
            AND (ds.expires_at IS NULL OR ds.expires_at > now())
        )
    );

-- Policy: Managers and HR can view documents for their team
CREATE POLICY "Managers and HR can view team documents" ON documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.supabase_id = auth.uid()
            AND e.role IN ('manager', 'hr', 'admin')
            AND (
                documents.employee_id IN (
                    SELECT id FROM employees WHERE manager_id = e.id
                )
                OR documents.employee_id = e.id
            )
        )
    );

-- Policy: Users can upload documents
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT
    WITH CHECK (
        uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE
    USING (
        uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE
    USING (
        uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Document Shares RLS Policies
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view document shares they created
CREATE POLICY "Users can view own document shares" ON document_shares
    FOR SELECT
    USING (
        shared_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        OR shared_with = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can create document shares for their documents
CREATE POLICY "Users can share own documents" ON document_shares
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_shares.document_id
            AND d.uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
        )
    );

-- Policy: Users can update document shares they created
CREATE POLICY "Users can update own document shares" ON document_shares
    FOR UPDATE
    USING (
        shared_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can delete document shares they created
CREATE POLICY "Users can delete own document shares" ON document_shares
    FOR DELETE
    USING (
        shared_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Document Audit Logs RLS Policies
ALTER TABLE document_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for documents they have access to
CREATE POLICY "Users can view document audit logs" ON document_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_audit_logs.document_id
            AND (
                d.uploaded_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
                OR d.employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
                OR EXISTS (
                    SELECT 1 FROM document_shares ds
                    WHERE ds.document_id = d.id
                    AND ds.shared_with = (SELECT id FROM employees WHERE supabase_id = auth.uid())
                    AND ds.is_active = true
                    AND (ds.expires_at IS NULL OR ds.expires_at > now())
                )
            )
        )
    );

-- Report Templates RLS Policies
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public report templates
CREATE POLICY "Users can view public report templates" ON report_templates
    FOR SELECT
    USING (is_public = true AND is_active = true);

-- Policy: Users can view report templates they created
CREATE POLICY "Users can view own report templates" ON report_templates
    FOR SELECT
    USING (created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid()));

-- Policy: Only managers and admins can create report templates
CREATE POLICY "Managers and admins can create report templates" ON report_templates
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE supabase_id = auth.uid() 
            AND role IN ('manager', 'admin', 'hr')
        )
    );

-- Policy: Users can update report templates they created
CREATE POLICY "Users can update own report templates" ON report_templates
    FOR UPDATE
    USING (
        created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can delete report templates they created
CREATE POLICY "Users can delete own report templates" ON report_templates
    FOR DELETE
    USING (
        created_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Report Executions RLS Policies
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own report executions
CREATE POLICY "Users can view own report executions" ON report_executions
    FOR SELECT
    USING (
        executed_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can create report executions
CREATE POLICY "Users can create report executions" ON report_executions
    FOR INSERT
    WITH CHECK (
        executed_by = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Notification Preferences RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can create their own notification preferences
CREATE POLICY "Users can create own notification preferences" ON notification_preferences
    FOR INSERT
    WITH CHECK (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );

-- Policy: Users can delete their own notification preferences
CREATE POLICY "Users can delete own notification preferences" ON notification_preferences
    FOR DELETE
    USING (
        employee_id = (SELECT id FROM employees WHERE supabase_id = auth.uid())
    );