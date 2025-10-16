import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestUser } from '../helpers/test-users';

test.describe('Leave Management System - Critical User Flows', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Create test user
    testUser = await createTestUser();
    
    // Navigate to the application
    await page.goto('/');
    
    // Login with test user
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
  });

  test.afterEach(async () => {
    // Cleanup test user
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  test('Complete leave request workflow', async ({ page }) => {
    // Navigate to leave requests
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.waitForURL('/dashboard/leave-requests');

    // Click new leave request button
    await page.click('button:has-text("New Leave Request")');

    // Fill leave request form
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Annual Leave' });
    await page.fill('input[name="startDate"]', '2024-02-01');
    await page.fill('input[name="endDate"]', '2024-02-05');
    await page.fill('textarea[name="reason"]', 'Family vacation');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.toast-success')).toContainText('Leave request submitted successfully');

    // Verify request appears in list
    await expect(page.locator('table')).toContainText('Annual Leave');
    await expect(page.locator('table')).toContainText('2024-02-01');
    await expect(page.locator('table')).toContainText('Pending');
  });

  test('Manager approval workflow', async ({ page }) => {
    // Create a leave request first
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Sick Leave' });
    await page.fill('input[name="startDate"]', '2024-02-10');
    await page.fill('input[name="endDate"]', '2024-02-12');
    await page.fill('textarea[name="reason"]', 'Medical appointment');
    await page.click('button[type="submit"]');

    // Navigate to approvals
    await page.click('a[href="/dashboard/approvals"]');
    await page.waitForURL('/dashboard/approvals');

    // Find the request and approve it
    await page.click('tr:has-text("Sick Leave") button:has-text("Review")');
    
    // Review details
    await expect(page.locator('.modal')).toContainText('Medical appointment');
    
    // Approve the request
    await page.click('button:has-text("Approve")');

    // Confirm approval
    await page.click('button:has-text("Confirm")');

    // Verify success message
    await expect(page.locator('.toast-success')).toContainText('Leave request approved successfully');

    // Verify status changed to approved
    await expect(page.locator('table')).toContainText('Approved');
  });

  test('Document upload and management', async ({ page }) => {
    // Navigate to documents
    await page.click('a[href="/dashboard/documents"]');
    await page.waitForURL('/dashboard/documents');

    // Click upload button
    await page.click('button:has-text("Upload Document")');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setFiles('test-files/sample-document.pdf');

    // Fill document details
    await page.fill('input[name="title"]', 'Test Document');
    await page.selectOption('select[name="categoryId"]', { label: 'Medical Certificate' });
    await page.fill('input[name="expiryDate"]', '2024-12-31');

    // Submit upload
    await page.click('button[type="submit"]');

    // Verify upload success
    await expect(page.locator('.toast-success')).toContainText('Document uploaded successfully');

    // Verify document appears in list
    await expect(page.locator('table')).toContainText('Test Document');
    await expect(page.locator('table')).toContainText('Medical Certificate');
  });

  test('Calendar integration and leave visibility', async ({ page }) => {
    // Navigate to calendar
    await page.click('a[href="/dashboard/calendar"]');
    await page.waitForURL('/dashboard/calendar');

    // Create a leave request
    await page.click('button:has-text("New Leave")');
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Annual Leave' });
    await page.fill('input[name="startDate"]', '2024-03-01');
    await page.fill('input[name="endDate"]', '2024-03-05');
    await page.fill('textarea[name="reason"]', 'Calendar test leave');
    await page.click('button[type="submit"]');

    // Verify event appears on calendar
    await expect(page.locator('.calendar-event')).toContainText('Annual Leave');
    await expect(page.locator('.calendar-event')).toContainText('Calendar test leave');

    // Click on event to view details
    await page.click('.calendar-event');
    
    // Verify modal shows details
    await expect(page.locator('.modal')).toContainText('Calendar test leave');
    await expect(page.locator('.modal')).toContainText('2024-03-01');
  });

  test('Reporting dashboard functionality', async ({ page }) => {
    // Navigate to reports
    await page.click('a[href="/dashboard/reports"]');
    await page.waitForURL('/dashboard/reports');

    // Verify key metrics are displayed
    await expect(page.locator('.metric-card')).toContainText('Total Leave Requests');
    await expect(page.locator('.metric-card')).toContainText('Approved Requests');
    await expect(page.locator('.metric-card')).toContainText('Pending Requests');
    await expect(page.locator('.metric-card')).toContainText('Utilization Rate');

    // Verify charts are present
    await expect(page.locator('.chart-container')).toHaveCount(3); // Pie, Line, and Bar charts

    // Test filtering
    await page.selectOption('select[name="department"]', { label: 'All Departments' });
    await page.selectOption('select[name="leaveType"]', { label: 'All Leave Types' });
    
    // Apply filters
    await page.click('button:has-text("Apply Filters")');

    // Verify charts update (wait for loading to complete)
    await page.waitForSelector('.chart-container:not(.loading)');

    // Test export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Report")');
    const download = await downloadPromise;
    
    // Verify download started
    expect(download.suggestedFilename()).toContain('leave-report');
  });

  test('Notification system', async ({ page }) => {
    // Create a leave request to trigger notifications
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Annual Leave' });
    await page.fill('input[name="startDate"]', '2024-04-01');
    await page.fill('input[name="endDate"]', '2024-04-05');
    await page.fill('textarea[name="reason"]', 'Notification test');
    await page.click('button[type="submit"]');

    // Navigate to dashboard to see notifications
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');

    // Check notification bell
    const notificationBell = page.locator('.notification-bell');
    await expect(notificationBell).toBeVisible();

    // Click notification bell
    await notificationBell.click();

    // Verify notifications dropdown
    await expect(page.locator('.notification-dropdown')).toBeVisible();
    
    // Check for leave request notification
    await expect(page.locator('.notification-item')).toContainText('Leave request submitted');

    // Mark notification as read
    await page.click('.notification-item button:has-text("Mark as read")');

    // Verify notification count updates
    await expect(page.locator('.notification-count')).toHaveText('0');
  });

  test('User profile and settings', async ({ page }) => {
    // Navigate to profile
    await page.click('.user-menu button');
    await page.click('a:has-text("Profile")');
    await page.waitForURL('/dashboard/profile');

    // Update profile information
    await page.fill('input[name="firstName"]', 'Updated');
    await page.fill('input[name="lastName"]', 'Name');
    await page.fill('input[name="phone"]', '+1234567890');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator('.toast-success')).toContainText('Profile updated successfully');

    // Test password change
    await page.click('button:has-text("Change Password")');
    await page.fill('input[name="currentPassword"]', testUser.password);
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button[type="submit"]');

    // Verify password change success
    await expect(page.locator('.toast-success')).toContainText('Password changed successfully');
  });

  test('Search and filtering functionality', async ({ page }) => {
    // Navigate to leave requests
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.waitForURL('/dashboard/leave-requests');

    // Create multiple leave requests
    const leaveRequests = [
      { type: 'Annual Leave', start: '2024-05-01', end: '2024-05-05', reason: 'Summer vacation' },
      { type: 'Sick Leave', start: '2024-05-10', end: '2024-05-12', reason: 'Medical leave' },
      { type: 'Personal Leave', start: '2024-05-15', end: '2024-05-17', reason: 'Personal matter' }
    ];

    for (const request of leaveRequests) {
      await page.click('button:has-text("New Leave Request")');
      await page.selectOption('select[name="leaveTypeId"]', { label: request.type });
      await page.fill('input[name="startDate"]', request.start);
      await page.fill('input[name="endDate"]', request.end);
      await page.fill('textarea[name="reason"]', request.reason);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000); // Wait for submission
    }

    // Test search functionality
    await page.fill('input[placeholder="Search leave requests..."]', 'vacation');
    await page.click('button:has-text("Search")');

    // Verify search results
    await expect(page.locator('table')).toContainText('Summer vacation');
    await expect(page.locator('table')).not.toContainText('Medical leave');

    // Test filtering by status
    await page.selectOption('select[name="status"]', { label: 'Pending' });
    await page.click('button:has-text("Apply Filters")');

    // Verify filtered results
    await expect(page.locator('table')).toContainText('Pending');
    await expect(page.locator('table')).not.toContainText('Approved');

    // Test date range filtering
    await page.fill('input[name="startDate"]', '2024-05-01');
    await page.fill('input[name="endDate"]', '2024-05-31');
    await page.click('button:has-text("Apply Filters")');

    // Verify all created requests are shown
    await expect(page.locator('table')).toContainText('Summer vacation');
    await expect(page.locator('table')).toContainText('Medical leave');
    await expect(page.locator('table')).toContainText('Personal matter');
  });

  test('Error handling and validation', async ({ page }) => {
    // Navigate to leave requests
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('.error-message')).toContainText('Leave type is required');
    await expect(page.locator('.error-message')).toContainText('Start date is required');
    await expect(page.locator('.error-message')).toContainText('End date is required');

    // Test invalid date range
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Annual Leave' });
    await page.fill('input[name="startDate"]', '2024-06-10');
    await page.fill('input[name="endDate"]', '2024-06-05'); // End before start
    await page.click('button[type="submit"]');

    // Verify date validation error
    await expect(page.locator('.error-message')).toContainText('End date must be after start date');

    // Test network error handling
    // Block API requests to simulate network failure
    await page.route('**/api/leave-requests', route => route.abort('failed'));
    
    // Try to submit valid form
    await page.fill('input[name="startDate"]', '2024-06-01');
    await page.fill('input[name="endDate"]', '2024-06-05');
    await page.fill('textarea[name="reason"]', 'Network error test');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.toast-error')).toContainText('Failed to submit leave request');
  });

  test('Accessibility compliance', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('a:focus')).toBeVisible();

    // Test screen reader announcements
    const announcements = page.locator('[role="status"], [role="alert"]');
    
    // Create a leave request to trigger announcements
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    
    // Verify form labels
    await expect(page.locator('label[for="leaveTypeId"]')).toBeVisible();
    await expect(page.locator('label[for="startDate"]')).toBeVisible();
    await expect(page.locator('label[for="endDate"]')).toBeVisible();

    // Test focus management
    await page.click('button[type="submit"]'); // Submit empty form
    
    // Verify focus moves to first error
    const firstError = page.locator('.error-message').first();
    await expect(firstError).toBeVisible();
    
    // Test ARIA attributes
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    await expect(page.locator('main[role="main"]')).toBeVisible();
    await expect(page.locator('[aria-label="Leave Management System"]')).toBeVisible();
  });
});