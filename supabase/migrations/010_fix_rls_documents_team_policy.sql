-- Migration: 008_fix_rls_documents_team_policy.sql
-- Description: Fix documents SELECT policy that referenced non-existent employees.manager_id
-- Rationale: The policy in 006_rls_calendar_documents_reporting.sql used employees.manager_id,
--            but the employees table does not define that column. We align team visibility
--            to department, consistent with other RLS policies.

-- Drop the incorrect policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'documents'
      AND policyname = 'Managers and HR can view team documents'
  ) THEN
    EXECUTE 'DROP POLICY "Managers and HR can view team documents" ON public.documents';
  END IF;
END $$;

-- Create corrected policy based on department alignment
CREATE POLICY "Managers and HR can view team documents (by department)" ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
        AND e.role IN ('manager', 'hr', 'admin')
        AND e.department = (
          SELECT department FROM public.employees emp WHERE emp.id = documents.employee_id
        )
    )
  );

COMMENT ON POLICY "Managers and HR can view team documents (by department)" ON public.documents IS
  'Managers, HR, and Admins can view documents of employees in their department';