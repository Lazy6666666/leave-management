-- Migration: Refine RLS policies for leaves table to align with PRD
-- Description: Restrict approval/rejection to Admin/HR; limit requester updates to pending requests without approver; use per-command policies
-- Author: CURSOR Development Assistant
-- Date: 2025-10-13

-- Ensure RLS is enabled
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive existing policies on leaves
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leaves' AND polname = 'leaves_requester_access') THEN
    DROP POLICY "leaves_requester_access" ON public.leaves;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leaves' AND polname = 'leaves_approver_access') THEN
    DROP POLICY "leaves_approver_access" ON public.leaves;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leaves' AND polname = 'leaves_department_access') THEN
    DROP POLICY "leaves_department_access" ON public.leaves;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leaves' AND polname = 'leaves_admin_access') THEN
    DROP POLICY "leaves_admin_access" ON public.leaves;
  END IF;
END $$;

-- SELECT policies
CREATE POLICY "leaves_requester_select" ON public.leaves
  FOR SELECT USING (
    requester_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
  );

CREATE POLICY "leaves_approver_select" ON public.leaves
  FOR SELECT USING (
    approver_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
  );

CREATE POLICY "leaves_department_select" ON public.leaves
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

CREATE POLICY "leaves_admin_select" ON public.leaves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- INSERT policies
CREATE POLICY "leaves_requester_insert" ON public.leaves
  FOR INSERT WITH CHECK (
    requester_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
    AND status = 'pending'
    AND approver_id IS NULL
  );

-- UPDATE policies
-- Requesters can edit their own pending requests while no approver is assigned; cannot change status or assign approver
CREATE POLICY "leaves_requester_update" ON public.leaves
  FOR UPDATE USING (
    requester_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
  )
  WITH CHECK (
    requester_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
    AND status = 'pending'
    AND approver_id IS NULL
  );

-- Only Admins/HR can approve/reject or assign approvers
CREATE POLICY "leaves_admin_hr_update" ON public.leaves
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- DELETE policies
CREATE POLICY "leaves_requester_delete" ON public.leaves
  FOR DELETE USING (
    requester_id IN (SELECT id FROM public.employees WHERE supabase_id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "leaves_admin_hr_delete" ON public.leaves
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

COMMENT ON POLICY "leaves_admin_hr_update" ON public.leaves IS 'Only Admin/HR can approve/reject and assign approvers';
COMMENT ON POLICY "leaves_requester_update" ON public.leaves IS 'Requesters may edit their own pending requests without approver assigned';
