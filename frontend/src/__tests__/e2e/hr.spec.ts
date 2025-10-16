import { test, expect } from '@playwright/test'

const { E2E_HR_EMAIL, E2E_HR_PASSWORD } = process.env

test.describe('HR E2E', () => {
  test.beforeEach(async ({ page }) => {
    if (E2E_HR_EMAIL && E2E_HR_PASSWORD) {
      await page.goto('/auth/login')
      await page.locator('#email').fill(E2E_HR_EMAIL)
      await page.locator('#password').fill(E2E_HR_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/dashboard/)
    }
  })

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page).toHaveTitle(/Leave Management|Create Next App/i)
  })

  test('Approvals page loads', async ({ page }) => {
    await page.goto('/dashboard/approvals')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/pending|approve|reject/i)
  })

  test('Documents management page loads', async ({ page }) => {
    await page.goto('/dashboard/documents')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main')).toContainText(/document|upload|delete|share/i)
  })
})