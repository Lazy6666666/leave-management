import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeaveRequestForm } from '../../../components/leave/leave-request-form'

// Mock the date-fns module
vi.mock('date-fns', () => ({
  differenceInBusinessDays: vi.fn().mockReturnValue(5),
  format: vi.fn().mockImplementation((date) => date.toString()),
  parseISO: vi.fn().mockImplementation((dateStr) => new Date(dateStr)),
}))

const sampleLeaveTypes = [
  {
    id: 'annual',
    name: 'Annual Leave',
    description: 'Paid annual leave',
    default_allocation_days: 20,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    description: 'Paid sick leave',
    default_allocation_days: 10,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('LeaveRequestForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders labels and action buttons', () => {
    render(
      <LeaveRequestForm 
        leaveTypes={sampleLeaveTypes}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getAllByText(/leave type/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/start date/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/end date/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/reason \(optional\)/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
  
  // Validation and submission are handled via Shadcn UI components and Supabase requests.
  // Detailed interaction tests can be added when helpers exist to interact with the Select/Calendar.
  
  it.skip('calculates business days correctly', () => {})
  
  it.skip('submits the form with valid data', () => {})
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <LeaveRequestForm 
        leaveTypes={sampleLeaveTypes}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalled()
  })
})