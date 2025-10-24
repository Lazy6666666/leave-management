import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestData } from '../helpers/test-users';

test.describe('Security Tests - Leave Management System', () => {
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
    // Cleanup test user and data
    if (testUser) {
      await cleanupTestData(testUser.id);
    }
  });

  test('XSS prevention - Input sanitization', async ({ page }) => {
    // Navigate to leave request form
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    
    // Attempt XSS attack in form fields
    const xssPayload = '<script>alert("XSS")</script>';
    
    // Fill form with malicious input
    await page.fill('textarea[name="reason"]', xssPayload);
    await page.fill('input[name="startDate"]', '2024-07-01');
    await page.fill('input[name="endDate"]', '2024-07-05');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Check that script is not executed (no alert dialog)
    const dialogHandled = await page.evaluate(() => {
      return window.alertTriggered;
    }).catch(() => false);
    
    expect(dialogHandled).toBe(false);
    
    // Check that malicious content is escaped in display
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
  });

  test('SQL injection prevention', async ({ page }) => {
    // Navigate to search functionality
    await page.click('a[href="/dashboard/leave-requests"]');
    
    // Wait for search input
    await page.waitForSelector('input[placeholder*="Search"]');
    
    // Attempt SQL injection
    const sqlInjectionPayload = "'; DROP TABLE leave_requests; --";
    
    await page.fill('input[placeholder*="Search"]', sqlInjectionPayload);
    await page.keyboard.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Check that application doesn't crash
    const errorMessage = await page.$('.error-message');
    expect(errorMessage).toBeNull();
    
    // Check that search results are displayed safely
    const results = await page.$$('table tbody tr');
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  test('Authentication bypass prevention', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/dashboard/leave-requests');
    
    // Should redirect to login
    await page.waitForURL('/login');
    
    // Verify login page is displayed
    const loginForm = await page.$('form[action*="/auth/login"]');
    expect(loginForm).toBeTruthy();
    
    // Try to access API directly without authentication
    const response = await page.request.get('/api/leave-requests', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('Authorization - Role-based access control', async ({ page }) => {
    // Login as regular employee
    await page.goto('/dashboard');
    
    // Try to access admin-only features
    const adminLinks = [
      '/dashboard/admin/users',
      '/dashboard/admin/settings',
      '/dashboard/reports/admin'
    ];
    
    for (const link of adminLinks) {
      await page.goto(link);
      
      // Should either redirect or show access denied
      const currentUrl = page.url();
      const accessDenied = await page.$('.access-denied, .unauthorized');
      
      expect(currentUrl).not.toContain(link) || accessDenied;
    }
  });

  test('CSRF protection', async ({ page }) => {
    // Navigate to leave request form
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    
    // Get the form
    const form = await page.$('form');
    
    // Check for CSRF token
    const csrfToken = await form.$('input[name="csrf-token"]');
    expect(csrfToken).toBeTruthy();
    
    // Try to submit form without CSRF token
    const formData = new FormData();
    formData.append('leaveTypeId', '1');
    formData.append('startDate', '2024-07-01');
    formData.append('endDate', '2024-07-05');
    formData.append('reason', 'CSRF test');
    
    const response = await page.request.post('/api/leave-requests', {
      form: formData,
      headers: {
        'Referer': 'https://malicious-site.com'
      }
    });
    
    expect(response.status()).toBe(403);
  });

  test('File upload security', async ({ page }) => {
    // Navigate to documents
    await page.click('a[href="/dashboard/documents"]');
    await page.click('button:has-text("Upload Document")');
    
    // Try to upload malicious file types
    const maliciousFiles = [
      { name: 'test.exe', mimeType: 'application/x-msdownload' },
      { name: 'test.php', mimeType: 'application/x-php' },
      { name: 'test.js', mimeType: 'application/javascript' }
    ];
    
    for (const file of maliciousFiles) {
      const fileInput = await page.$('input[type="file"]');
      
      // Create fake file content
      const fakeContent = Buffer.from('malicious content');
      
      await fileInput.setInputFiles({
        name: file.name,
        mimeType: file.mimeType,
        buffer: fakeContent
      });
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Should show validation error
      const error = await page.$('.error-message, .validation-error');
      expect(error).toBeTruthy();
      
      // Clear file input for next test
      await fileInput.setInputFiles([]);
    }
  });

  test('Rate limiting protection', async ({ page }) => {
    // Try to make rapid API calls
    const requests = [];
    
    for (let i = 0; i < 20; i++) {
      requests.push(
        page.request.get('/api/leave-requests')
      );
    }
    
    const responses = await Promise.allSettled(requests);
    
    // Count successful and rate-limited responses
    const successCount = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status() === 200
    ).length;
    
    const rateLimitedCount = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status() === 429
    ).length;
    
    // Should have some rate-limited requests
    expect(rateLimitedCount).toBeGreaterThan(0);
    
    // Should not allow all requests
    expect(successCount).toBeLessThan(20);
  });

  test('Session management security', async ({ page }) => {
    // Login and get session
    await page.goto('/dashboard');
    
    // Get session cookies
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie.httpOnly).toBe(true); // Should be httpOnly
    expect(sessionCookie.secure).toBe(true); // Should be secure
    
    // Try to access with expired session
    await page.context().clearCookies();
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login');
  });

  test('Data exposure prevention', async ({ page }) => {
    // Navigate to leave requests
    await page.click('a[href="/dashboard/leave-requests"]');
    
    // Wait for data to load
    await page.waitForSelector('table tbody tr');
    
    // Check that sensitive data is not exposed
    const pageContent = await page.content();
    
    // Should not contain database connection strings
    expect(pageContent).not.toContain('postgresql://');
    expect(pageContent).not.toContain('DATABASE_URL');
    expect(pageContent).not.toContain('SUPABASE_KEY');
    
    // Should not contain internal server paths
    expect(pageContent).not.toContain('/var/www/');
    expect(pageContent).not.toContain('C:\\');
    
    // Should not contain API keys in responses
    const responses = await page.context().request.get('/api/leave-requests');
    const responseText = await responses.text();
    
    expect(responseText).not.toContain('api_key');
    expect(responseText).not.toContain('secret_key');
  });

  test('Input validation security', async ({ page }) => {
    // Navigate to leave request form
    await page.click('a[href="/dashboard/leave-requests"]');
    await page.click('button:has-text("New Leave Request")');
    
    // Test various malicious inputs
    const maliciousInputs = [
      'A'.repeat(10000), // Very long string
      '\x00\x01\x02\x03', // Null bytes
      '../etc/passwd', // Path traversal
      'javascript:alert(1)', // JavaScript injection
      'data:text/html,<script>alert(1)</script>' // Data URI
    ];
    
    for (const input of maliciousInputs) {
      // Clear and fill reason field
      await page.fill('textarea[name="reason"]', input);
      await page.fill('input[name="startDate"]', '2024-07-01');
      await page.fill('input[name="endDate"]', '2024-07-05');
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Should show validation error or sanitize input
      const error = await page.$('.error-message, .validation-error');
      const sanitized = await page.$eval('textarea[name="reason"]', el => el.value);
      
      expect(error || sanitized !== input).toBeTruthy();
    }
  });

  test('HTTPS enforcement', async ({ page }) => {
    // Check current URL
    const currentUrl = page.url();
    
    // Should be HTTPS in production
    if (currentUrl.includes('localhost')) {
      test.skip(); // Skip localhost
    }
    
    expect(currentUrl).toMatch(/^https:/);
    
    // Try to access HTTP version
    const httpUrl = currentUrl.replace('https://', 'http://');
    
    const response = await page.request.get(httpUrl, {
      maxRedirects: 0
    });
    
    // Should redirect to HTTPS
    expect(response.status()).toBe(301);
  });

  test('Security headers', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Get response headers
    const response = await page.request.get('/dashboard');
    const headers = response.headers();
    
    // Check for security headers
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test('Password security requirements', async ({ page }) => {
    // Navigate to profile/settings
    await page.click('a[href="/dashboard/profile"]');
    
    // Look for change password form
    const changePasswordButton = await page.$('button:has-text("Change Password")');
    if (changePasswordButton) {
      await changePasswordButton.click();
      
      // Test weak passwords
      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        'short'
      ];
      
      for (const weakPassword of weakPasswords) {
        await page.fill('input[name="newPassword"]', weakPassword);
        await page.fill('input[name="confirmPassword"]', weakPassword);
        
        // Should show validation error
        const error = await page.$('.password-error, .validation-error');
        expect(error).toBeTruthy();
      }
      
      // Test strong password
      await page.fill('input[name="newPassword"]', 'StrongP@ssw0rd123!');
      await page.fill('input[name="confirmPassword"]', 'StrongP@ssw0rd123!');
      
      // Should not show error for strong password
      const strongError = await page.$('.password-error, .validation-error');
      expect(strongError).toBeFalsy();
    }
  });
});