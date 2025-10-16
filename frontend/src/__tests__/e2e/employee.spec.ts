import { test, expect } from '@playwright/test'

const { E2E_EMPLOYEE_EMAIL, E2E_EMPLOYEE_PASSWORD } = process.env

test.describe('Employee E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Optional login if creds provided
    if (E2E_EMPLOYEE_EMAIL && E2E_EMPLOYEE_PASSWORD) {
      await page.goto('/auth/login')
      await page.locator('#email').fill(E2E_EMPLOYEE_EMAIL)
      await page.locator('#password').fill(E2E_EMPLOYEE_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/dashboard/)
    }
  })

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/dashboard|auth\/login/, { timeout: 15000 })
    const url = page.url()
    if (/auth\/login/.test(url)) {
      // Unauthenticated users should be redirected to login; ensure login UI is visible
      await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible()
    } else {
      await expect(page).toHaveURL(/dashboard/)
      // Be tolerant to loading states; look for a Dashboard navigation link or header text
      const dashboardLink = page.getByRole('link', { name: /dashboard/i })
      await expect(dashboardLink).toBeVisible({ timeout: 15000 })
      await expect(page).toHaveTitle(/Leave Management|Create Next App/i)
    }
  })

  test('Leaves page loads', async ({ page }) => {
    await page.goto('/dashboard/leaves')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/leave/i)
  })

  test('Documents page loads', async ({ page }) => {
    await page.goto('/dashboard/documents')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/document/i)
  })
})