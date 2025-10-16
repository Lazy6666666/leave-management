import { test, expect } from '@playwright/test'

const { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } = process.env

test.describe('Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    if (E2E_ADMIN_EMAIL && E2E_ADMIN_PASSWORD) {
      await page.goto('/auth/login')
      await page.locator('#email').fill(E2E_ADMIN_EMAIL)
      await page.locator('#password').fill(E2E_ADMIN_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/dashboard/)
    }
  })

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page).toHaveTitle(/Leave Management|Create Next App/i)
  })

  test('Admin → Users page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/users')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/user|email|role|add/i)
  })

  test('Admin → Roles page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/roles')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/role|permission|assign/i)
  })

  test('Admin → Audit Logs page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/audit-logs')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/audit|log|action|table/i)
  })
})