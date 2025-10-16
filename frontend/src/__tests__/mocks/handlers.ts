import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      },
    })
  }),

  // Mock Supabase REST API endpoints
  http.get('*/rest/v1/employees', () => {
    return HttpResponse.json([
      {
        id: 'mock-employee-id',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'employee',
        department: 'Engineering',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('*/rest/v1/leaves', () => {
    return HttpResponse.json([
      {
        id: 'mock-leave-id',
        requester_id: 'mock-employee-id',
        leave_type_id: 'mock-leave-type-id',
        start_date: '2025-02-01',
        end_date: '2025-02-05',
        days_count: 5,
        status: 'pending',
        reason: 'Vacation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('*/rest/v1/leave_types', () => {
    return HttpResponse.json([
      {
        id: 'mock-leave-type-id',
        name: 'Annual Leave',
        description: 'Regular vacation time',
        default_allocation_days: 25,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),
]
