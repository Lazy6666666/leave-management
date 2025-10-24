-- Migration: 011_fix_employees_rls_recursion.sql (backend mirror)
-- Purpose: Fix infinite recursion in employees RLS policy by removing self-referential subqueries

-- Create helper function to get current user's department (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS text STABLE AS $$
DECLARE
  dept text;
BEGIN
  SELECT e.department INTO dept
  FROM public.employees e
  WHERE e.supabase_id = auth.uid();

  RETURN dept;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_current_user_department() IS 'Returns the department of the current authenticated user. SECURITY DEFINER to avoid RLS recursion.';

-- Ensure function executes in a safe search_path and is accessible to API roles
ALTER FUNCTION public.get_current_user_department() SET search_path = public, pg_temp;
GRANT EXECUTE ON FUNCTION public.get_current_user_department() TO anon, authenticated;

-- Drop the recursive policy and recreate with helper functions
DROP POLICY IF EXISTS "employees_department_access" ON public.employees;

CREATE POLICY "employees_department_access" ON public.employees
  FOR SELECT USING (
    get_user_role() IN ('manager', 'admin', 'hr')
    AND employees.department = public.get_current_user_department()
  );

-- Note: Other employees policies remain unchanged