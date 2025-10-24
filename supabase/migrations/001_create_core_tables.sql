-- Migration: Create Core Tables
-- Description: Creates the fundamental tables for the Leave Management System
-- Author: CURSOR Development Assistant
-- Date: 2025-01-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin', 'hr');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  role user_role NOT NULL DEFAULT 'employee',
  department text,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT employees_email_unique UNIQUE (email)
);

-- Create leave_types table
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  default_allocation_days integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  total_days integer NOT NULL DEFAULT 0,
  used_days integer NOT NULL DEFAULT 0,
  year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT leave_balances_employee_type_year_unique
  UNIQUE (employee_id, leave_type_id, year)
);

-- Create leaves table
CREATE TABLE IF NOT EXISTS public.leaves (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days_count integer NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  reason text,
  approver_id uuid REFERENCES public.employees(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT leaves_valid_dates CHECK (end_date >= start_date),
  CONSTRAINT leaves_positive_days CHECK (days_count > 0)
);

-- Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_supabase_id ON public.employees(supabase_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_leaves_requester_id ON public.leaves(requester_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leaves_approver_id ON public.leaves(approver_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_type_year ON public.leave_balances(employee_id, leave_type_id, year);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_company_documents_expiry ON public.company_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_company_documents_uploaded_by ON public.company_documents(uploaded_by);

-- Add comments for documentation
COMMENT ON TABLE public.employees IS 'Employee profiles and authentication data';
COMMENT ON TABLE public.leave_types IS 'Types of leave available in the system';
COMMENT ON TABLE public.leave_balances IS 'Employee leave balances by type and year';
COMMENT ON TABLE public.leaves IS 'Leave requests and approvals';
COMMENT ON TABLE public.company_documents IS 'Company documents and file uploads';
COMMENT ON TABLE public.audit_logs IS 'System audit trail for compliance';
