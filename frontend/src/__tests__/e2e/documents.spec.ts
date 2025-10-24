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

test.describe('Documents', () => {
  test('Documents page loads and shows search/filter controls', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/documents')
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('combobox')).toBeVisible()
  })

  test('Upload dialog controls are present', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/documents')
    // Try to find an Upload button; label may vary
    const uploadBtn = page.getByRole('button', { name: /upload/i })
    await expect(uploadBtn).toBeVisible()
    await uploadBtn.click()
    // Expect typical fields in upload dialog/form
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible()
  })

  test('Export dialog opens and shows format options', async ({ page }) => {
    await loginIfCredsProvided(page)
    await page.goto('/dashboard/documents')
    const exportBtn = page.getByRole('button', { name: /export/i })
    await expect(exportBtn).toBeVisible()
    await exportBtn.click()
    // Expect format selection (CSV/Excel/PDF)
    await expect(page.getByText(/csv/i)).toBeVisible()
    await expect(page.getByText(/excel/i)).toBeVisible()
    await expect(page.getByText(/pdf/i)).toBeVisible()
  })
})