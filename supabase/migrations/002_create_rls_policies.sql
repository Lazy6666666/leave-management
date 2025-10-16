-- Migration: Create Row-Level Security Policies
-- Description: Implements RLS policies for all tables to ensure data security
-- Author: CURSOR Development Assistant
-- Date: 2025-01-27

-- Enable Row Level Security on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

-- Create helper function to get employee ID from Supabase UID
CREATE OR REPLACE FUNCTION get_employee_id_by_supabase_uid(user_uuid uuid)
RETURNS uuid AS $$
DECLARE
  employee_id uuid;
BEGIN
  SELECT id INTO employee_id
  FROM public.employees
  WHERE supabase_id = user_uuid;
  
  RETURN employee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT e.role INTO user_role
  FROM public.employees e
  WHERE e.supabase_id = auth.uid();

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is manager of department
CREATE OR REPLACE FUNCTION is_manager_of_department(department_name text)
RETURNS boolean AS $$
DECLARE
  user_role user_role;
  user_department text;
BEGIN
  SELECT e.role, e.department INTO user_role, user_department
  FROM public.employees e
  WHERE e.supabase_id = auth.uid();

  RETURN (user_role IN ('manager', 'admin', 'hr') AND user_department = department_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- EMPLOYEES TABLE POLICIES
-- Users can see their own profile
CREATE POLICY "employees_self_access" ON public.employees
  FOR ALL USING (supabase_id = auth.uid());

-- Managers can see employees in their department
CREATE POLICY "employees_department_access" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = employees.department
    )
  );

-- Admins and HR can see all employees
CREATE POLICY "employees_admin_access" ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- LEAVE_TYPES TABLE POLICIES
-- All authenticated users can read leave types
CREATE POLICY "leave_types_read_all" ON public.leave_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins and HR can modify leave types
CREATE POLICY "leave_types_admin_write" ON public.leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- LEAVE_BALANCES TABLE POLICIES
-- Users can see their own leave balances
CREATE POLICY "leave_balances_self_access" ON public.leave_balances
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

-- Managers can see leave balances for their department
CREATE POLICY "leave_balances_department_access" ON public.leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = (
        SELECT department FROM public.employees emp WHERE emp.id = leave_balances.employee_id
      )
    )
  );

-- Only admins and HR can modify leave balances
CREATE POLICY "leave_balances_admin_write" ON public.leave_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- LEAVES TABLE POLICIES
-- Users can see their own leave requests
CREATE POLICY "leaves_requester_access" ON public.leaves
  FOR ALL USING (
    requester_id IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

-- Approvers can see and modify leave requests assigned to them
CREATE POLICY "leaves_approver_access" ON public.leaves
  FOR ALL USING (
    approver_id IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

-- Managers can see leave requests from their department
CREATE POLICY "leaves_department_access" ON public.leaves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = (
        SELECT department FROM public.employees emp WHERE emp.id = leaves.requester_id
      )
    )
  );

-- Admins and HR can see all leave requests
CREATE POLICY "leaves_admin_access" ON public.leaves
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- COMPANY_DOCUMENTS TABLE POLICIES
-- Users can see documents they uploaded
CREATE POLICY "company_documents_uploader_access" ON public.company_documents
  FOR ALL USING (
    uploaded_by IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

-- Managers can see documents from their department
CREATE POLICY "company_documents_department_access" ON public.company_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = (
        SELECT department FROM public.employees emp WHERE emp.id = company_documents.uploaded_by
      )
    )
  );

-- Admins and HR can see all documents
CREATE POLICY "company_documents_admin_access" ON public.company_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- AUDIT_LOGS TABLE POLICIES
-- Only admins and HR can read audit logs
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- System can insert audit logs (no user policy needed for inserts)
CREATE POLICY "audit_logs_system_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON FUNCTION get_employee_id_by_supabase_uid(uuid) IS 'Helper function to get employee ID from Supabase UID';
COMMENT ON FUNCTION get_user_role() IS 'Helper function to get current user role';
COMMENT ON FUNCTION is_manager_of_department(text) IS 'Helper function to check if user is manager of specific department';
