-- Migration: Create Business Logic Functions
-- Description: Implements PostgreSQL functions for business logic and calculations
-- Author: CURSOR Development Assistant
-- Date: 2025-01-27

-- Function to calculate business days between two dates (excluding weekends)
CREATE OR REPLACE FUNCTION calculate_business_days(start_date date, end_date date)
RETURNS integer AS $$
DECLARE
  business_days integer := 0;
  current_date date := start_date;
BEGIN
  -- Validate input dates
  IF start_date > end_date THEN
    RETURN 0;
  END IF;

  -- Calculate business days (Monday = 1, Sunday = 7)
  WHILE current_date <= end_date LOOP
    -- Check if current date is a weekday (Monday to Friday)
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
      business_days := business_days + 1;
    END IF;
    current_date := current_date + INTERVAL '1 day';
  END LOOP;

  RETURN business_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available leave days for an employee
CREATE OR REPLACE FUNCTION get_available_leave_days(
  p_employee_id uuid,
  p_leave_type_id uuid,
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS integer AS $$
DECLARE
  available_days integer;
BEGIN
  SELECT COALESCE(lb.total_days - lb.used_days, 0) INTO available_days
  FROM public.leave_balances lb
  WHERE lb.employee_id = p_employee_id
  AND lb.leave_type_id = p_leave_type_id
  AND lb.year = p_year;

  RETURN COALESCE(available_days, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for overlapping leave requests
CREATE OR REPLACE FUNCTION check_overlapping_leaves(
  p_employee_id uuid,
  p_start_date date,
  p_end_date date,
  p_exclude_leave_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  overlap_count integer;
BEGIN
  SELECT COUNT(*) INTO overlap_count
  FROM public.leaves l
  WHERE l.requester_id = p_employee_id
  AND l.status IN ('pending', 'approved')
  AND (p_exclude_leave_id IS NULL OR l.id != p_exclude_leave_id)
  AND (
    (l.start_date <= p_start_date AND l.end_date >= p_start_date) OR
    (l.start_date <= p_end_date AND l.end_date >= p_end_date) OR
    (l.start_date >= p_start_date AND l.end_date <= p_end_date)
  );

  RETURN overlap_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leave balance when leave is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  current_year integer;
  balance_record record;
BEGIN
  -- Only process when status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    current_year := EXTRACT(YEAR FROM NEW.start_date);
    
    -- Get or create leave balance record
    SELECT * INTO balance_record
    FROM public.leave_balances
    WHERE employee_id = NEW.requester_id
    AND leave_type_id = NEW.leave_type_id
    AND year = current_year;
    
    IF balance_record IS NULL THEN
      -- Create new balance record
      INSERT INTO public.leave_balances (employee_id, leave_type_id, total_days, used_days, year)
      VALUES (NEW.requester_id, NEW.leave_type_id, 0, NEW.days_count, current_year);
    ELSE
      -- Update existing balance record
      UPDATE public.leave_balances
      SET used_days = used_days + NEW.days_count,
          updated_at = now()
      WHERE id = balance_record.id;
    END IF;
  END IF;

  -- If status changes from approved to something else, reverse the balance
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    current_year := EXTRACT(YEAR FROM OLD.start_date);
    
    UPDATE public.leave_balances
    SET used_days = used_days - OLD.days_count,
        updated_at = now()
    WHERE employee_id = OLD.requester_id
    AND leave_type_id = OLD.leave_type_id
    AND year = current_year;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user's employee ID
  SELECT get_employee_id_by_supabase_uid(auth.uid()) INTO current_user_id;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    current_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    COALESCE(p_metadata, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leave summary for an employee
CREATE OR REPLACE FUNCTION get_employee_leave_summary(
  p_employee_id uuid,
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
  leave_type_name text,
  total_days integer,
  used_days integer,
  available_days integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lt.name as leave_type_name,
    COALESCE(lb.total_days, 0) as total_days,
    COALESCE(lb.used_days, 0) as used_days,
    COALESCE(lb.total_days - lb.used_days, 0) as available_days
  FROM public.leave_types lt
  LEFT JOIN public.leave_balances lb ON (
    lb.leave_type_id = lt.id 
    AND lb.employee_id = p_employee_id 
    AND lb.year = p_year
  )
  WHERE lt.is_active = true
  ORDER BY lt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get department leave calendar
CREATE OR REPLACE FUNCTION get_department_leave_calendar(
  p_department text,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  employee_name text,
  leave_type_name text,
  start_date date,
  end_date date,
  status leave_status,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    lt.name as leave_type_name,
    l.start_date,
    l.end_date,
    l.status,
    l.reason
  FROM public.leaves l
  JOIN public.employees e ON e.id = l.requester_id
  JOIN public.leave_types lt ON lt.id = l.leave_type_id
  WHERE e.department = p_department
  AND l.start_date <= p_end_date
  AND l.end_date >= p_start_date
  AND l.status IN ('approved', 'pending')
  ORDER BY l.start_date, e.first_name, e.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic balance updates
CREATE TRIGGER trigger_update_leave_balance_on_approval
  AFTER INSERT OR UPDATE OF status ON public.leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_leave_balance_on_approval();

-- Create trigger for audit logging on leaves table
CREATE OR REPLACE FUNCTION trigger_audit_leaves()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change
  PERFORM log_audit_event(
    TG_OP,
    'leaves',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
    jsonb_build_object(
      'requester_id', COALESCE(NEW.requester_id, OLD.requester_id),
      'leave_type_id', COALESCE(NEW.leave_type_id, OLD.leave_type_id),
      'status', COALESCE(NEW.status, OLD.status)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_leaves_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.leaves
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_leaves();

-- Add comments for documentation
COMMENT ON FUNCTION calculate_business_days(date, date) IS 'Calculates business days between two dates excluding weekends';
COMMENT ON FUNCTION get_available_leave_days(uuid, uuid, integer) IS 'Gets available leave days for an employee by leave type and year';
COMMENT ON FUNCTION check_overlapping_leaves(uuid, date, date, uuid) IS 'Checks if leave request overlaps with existing approved/pending leaves';
COMMENT ON FUNCTION update_leave_balance_on_approval() IS 'Trigger function to update leave balances when leave is approved';
COMMENT ON FUNCTION log_audit_event(text, text, uuid, jsonb, jsonb, jsonb) IS 'Logs audit events for compliance tracking';
COMMENT ON FUNCTION get_employee_leave_summary(uuid, integer) IS 'Gets leave summary for an employee by year';
COMMENT ON FUNCTION get_department_leave_calendar(text, date, date) IS 'Gets leave calendar for a department within date range';
