import { test, expect } from '@playwright/test';

import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Leave Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/auth/login');
    await page.fill('[name=email]', 'test-employee@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.afterEach(async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page);
  });

  test('Create leave request', async ({ page }) => {
    await page.goto('/dashboard/leaves/new');
    await page.selectOption('select[name=leaveTypeId]', { label: 'Vacation' });
    await page.fill('input[name=startDate]', '2025-02-01');
    await page.fill('input[name=endDate]', '2025-02-05');
    await page.fill('textarea[name=reason]', 'Test vacation request');
    await page.click('button[type=submit]');
    await expect(page.getByText('Leave request submitted successfully')).toBeVisible();
    await expect(page).toHaveURL('/dashboard/leaves');
  });

  test('View leave details', async ({ page }) => {
    await page.goto('/dashboard/leaves');
    await page.click('text=Test vacation request'); // Assuming the list shows reason or something
    await expect(page.getByText('Vacation')).toBeVisible();
    await expect(page.getByText('2025-02-01 to 2025-02-05')).toBeVisible();
  });

  test('Manager approves leave request', async ({ page }) => {
    // Login as manager
    await page.goto('/auth/login');
    await page.fill('[name=email]', 'test-manager@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');

    // Navigate to pending requests
    await page.goto('/dashboard/leaves'); // Assuming all leaves are shown, or filter for pending
    await page.click('text=Test vacation request'); // Assuming a pending request exists
    await page.click('button:has-text("Approve")');
    await page.fill('textarea', 'Approved for vacation');
    await page.click('button:has-text("Approve")');
    await expect(page.getByText('Leave request approved successfully')).toBeVisible();
  });

  test('Manager rejects leave request', async ({ page }) => {
    // Similar to above, login as manager
    await page.goto('/auth/login');
    await page.fill('[name=email]', 'test-manager@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/dashboard/leaves'); // Assuming all leaves are shown, or filter for pending
    await page.click('text=Another test request');
    await page.click('button:has-text("Reject")');
    await page.fill('textarea', 'Rejected due to scheduling conflict');
    await page.click('button:has-text("Reject")');
    await expect(page.getByText('Leave request rejected')).toBeVisible();
  });

  test('Employee cancels pending request', async ({ page }) => {
    // Login as employee
    await page.goto('/auth/login');
    await page.fill('[name=email]', 'test-employee@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/dashboard/leaves');
    await page.click('text=Pending test request');
    await page.click('button:has-text("Cancel Request")');
    await page.click('button:has-text("Confirm")'); // Assuming there's a confirmation dialog
    await expect(page.getByText('Leave request canceled')).toBeVisible();
  });
});
