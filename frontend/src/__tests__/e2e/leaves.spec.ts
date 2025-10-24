import { test, expect } from '@playwright/test'

const { E2E_USER_EMAIL, E2E_USER_PASSWORD } = process.env

async function loginIfCredsProvided(page) {
  if (E2E_USER_EMAIL && E2E_USER_PASSWORD) {
    await page.goto('/auth/login')
    await page.locator('#email').fill(E2E_USER_EMAIL)
    await page.locator('#password').fill(E2E_USER_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  }
}

test.describe('Leaves', () => {
  test('Leaves page loads and shows new request button', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/leaves')
    await expect(page.getByRole('button', { name: /new leave request/i })).toBeVisible()
  })

  test('Leave Request form fields are present', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/leaves')
    await page.getByRole('button', { name: /new leave request/i }).click()
    await expect(page.getByLabel(/leave type/i)).toBeVisible()
    await expect(page.getByLabel(/start date/i)).toBeVisible()
    await expect(page.getByLabel(/end date/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /submit leave request/i })).toBeVisible()
  })

  test('Approvals table is visible for approvers (HR/Manager/Admin)', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/leaves')
    // Table for approvals; use loose expectation to avoid coupling to exact copy
    await expect(page.locator('table')).toBeVisible()
  })
})