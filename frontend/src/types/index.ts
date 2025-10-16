// Core types for the Leave Management System

export type UserRole = 'employee' | 'manager' | 'admin' | 'hr'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Employee {
  id: string
  supabase_id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  department: string | null
  photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeaveType {
  id: string
  name: string
  description: string | null
  default_allocation_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  total_days: number
  used_days: number
  year: number
  created_at: string
  updated_at: string
  leave_type?: LeaveType
}

export interface Leave {
  id: string
  requester_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_count: number
  status: LeaveStatus
  reason: string | null
  // Optional reviewer comment added by approver/manager when processing the request
  reviewer_comment?: string | null
  approver_id: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  requester?: Employee
  approver?: Employee
  leave_type?: LeaveType
}

export interface CompanyDocument {
  id: string
  uploaded_by: string
  name: string
  storage_path: string
  expiry_date: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  uploader?: Employee
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  metadata: Record<string, unknown>
  created_at: string
  user?: Employee
}

// Form types
export interface LeaveRequestFormData {
  leave_type_id: string
  start_date: string
  end_date: string
  reason?: string
}

export interface EmployeeFormData {
  email: string
  first_name: string
  last_name: string
  role: UserRole
  department: string
  is_active: boolean
}

export interface LeaveTypeFormData {
  name: string
  description?: string
  default_allocation_days: number
  is_active: boolean
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Dashboard types
export interface DashboardStats {
  total_employees: number
  pending_leaves: number
  approved_leaves: number
  rejected_leaves: number
  upcoming_leaves: number
}

export interface LeaveSummary {
  leave_type_name: string
  total_days: number
  used_days: number
  available_days: number
}

// Calendar types
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  status: LeaveStatus
  employee_name: string
  leave_type: string
  reason?: string
}

// Filter types
export interface LeaveFilters {
  status?: LeaveStatus[]
  leave_type_id?: string
  department?: string
  start_date?: string
  end_date?: string
  employee_id?: string
}

export interface EmployeeFilters {
  role?: UserRole[]
  department?: string
  is_active?: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Component props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export interface ErrorProps extends BaseComponentProps {
  title?: string
  message?: string
  onRetry?: () => void
}
