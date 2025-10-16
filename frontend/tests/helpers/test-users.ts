import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TestUser {
  id: string;
  email: string;
  password: string;
  employeeId: string;
}

export async function createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const timestamp = Date.now();
  const email = `test.user.${timestamp}@example.com`;
  const password = 'TestPassword123!';
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create test user: ${authError.message}`);
  }

  // Create employee record
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .insert({
      user_id: authData.user.id,
      employee_id: `EMP${timestamp}`,
      first_name: 'Test',
      last_name: 'User',
      email,
      department_id: 1,
      position: 'Software Engineer',
      hire_date: new Date().toISOString(),
      status: 'active'
    })
    .select()
    .single();

  if (employeeError) {
    // Cleanup auth user if employee creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create employee record: ${employeeError.message}`);
  }

  return {
    id: authData.user.id,
    email,
    password,
    employeeId: employeeData.employee_id,
    ...overrides
  };
}

export async function cleanupTestUser(userId: string): Promise<void> {
  // Delete employee record first
  const { error: employeeError } = await supabase
    .from('employees')
    .delete()
    .eq('user_id', userId);

  if (employeeError) {
    console.error(`Failed to delete employee record: ${employeeError.message}`);
  }

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error(`Failed to delete test user: ${authError.message}`);
  }
}

export async function createTestLeaveRequest(userId: string, overrides: Record<string, unknown> = {}) {
  const { data: employee } = await supabase
    .from('employees')
    .select('id, department_id')
    .eq('user_id', userId)
    .single();

  if (!employee) {
    throw new Error('Employee not found for user');
  }

  const { data, error } = await supabase
    .from('leave_requests')
    .insert({
      employee_id: employee.id,
      department_id: employee.department_id,
      leave_type_id: 1,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      status: 'pending',
      reason: 'Test leave request',
      created_by: userId,
      ...overrides
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test leave request: ${error.message}`);
  }

  return data;
}

export async function createTestDocument(userId: string, overrides: Record<string, unknown> = {}) {
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!employee) {
    throw new Error('Employee not found for user');
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      employee_id: employee.id,
      title: 'Test Document',
      file_name: 'test-document.pdf',
      file_path: 'documents/test-document.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      category_id: 1,
      uploaded_by: userId,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      ...overrides
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test document: ${error.message}`);
  }

  return data;
}

export async function createTestNotification(userId: string, overrides: Record<string, unknown> = {}) {
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!employee) {
    throw new Error('Employee not found for user');
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      employee_id: employee.id,
      type: 'leave_request',
      title: 'Test Notification',
      message: 'This is a test notification',
      is_read: false,
      ...overrides
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test notification: ${error.message}`);
  }

  return data;
}

export async function cleanupTestData(userId: string): Promise<void> {
  try {
    // Get employee ID
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (employee) {
      // Delete related data
      await supabase.from('leave_requests').delete().eq('employee_id', employee.id);
      await supabase.from('documents').delete().eq('employee_id', employee.id);
      await supabase.from('notifications').delete().eq('employee_id', employee.id);
      await supabase.from('leave_approvals').delete().eq('approver_id', employee.id);
    }

    // Delete user
    await cleanupTestUser(userId);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}