import { test, expect } from '@playwright/test'

const { E2E_MANAGER_EMAIL, E2E_MANAGER_PASSWORD } = process.env

test.describe('Manager E2E', () => {
  test.beforeEach(async ({ page }) => {
    if (E2E_MANAGER_EMAIL && E2E_MANAGER_PASSWORD) {
      await page.goto('/auth/login')
      await page.locator('#email').fill(E2E_MANAGER_EMAIL)
      await page.locator('#password').fill(E2E_MANAGER_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/dashboard/)
    }
  })

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page).toHaveTitle(/Leave Management|Create Next App/i)
  })

  test('Approvals page loads and shows table', async ({ page }) => {
    await page.goto('/dashboard/approvals')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/approve|pending|requests/i)
  })

  test('Team calendar loads', async ({ page }) => {
    await page.goto('/dashboard/calendar')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/calendar|event/i)
  })
})