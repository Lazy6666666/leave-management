import { z } from 'zod'

export const employeeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['employee', 'manager', 'admin', 'hr']),
  department: z.string().min(1, 'Department is required'),
  is_active: z.boolean().default(true),
})

export const employeeUpdateSchema = employeeSchema.partial().omit({ email: true })

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  department: z.string().min(1, 'Department is required'),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
