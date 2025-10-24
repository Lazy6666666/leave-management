import { z } from 'zod'

export const leaveRequestSchema = z.object({
  leave_type_id: z.string().uuid('Please select a leave type'),
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today
    }, 'Start date must be today or in the future'),
  end_date: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate >= startDate
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
})

export const leaveApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comment: z.string().optional(),
})

export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  description: z.string().optional(),
  default_allocation_days: z.number()
    .min(0, 'Allocation days must be 0 or greater')
    .max(365, 'Allocation days cannot exceed 365'),
  is_active: z.boolean().default(true),
})

export const leaveBalanceSchema = z.object({
  employee_id: z.string().uuid('Please select an employee'),
  leave_type_id: z.string().uuid('Please select a leave type'),
  total_days: z.number()
    .min(0, 'Total days must be 0 or greater')
    .max(365, 'Total days cannot exceed 365'),
  year: z.number()
    .min(2020, 'Year must be 2020 or later')
    .max(2030, 'Year must be 2030 or earlier'),
})

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>
export type LeaveApprovalFormData = z.infer<typeof leaveApprovalSchema>
export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>
export type LeaveBalanceFormData = z.infer<typeof leaveBalanceSchema>
