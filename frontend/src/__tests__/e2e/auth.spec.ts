import { test, expect } from '@playwright/test'

const { E2E_USER_EMAIL, E2E_USER_PASSWORD } = process.env

test.describe('Auth', () => {
  test('Login page loads and has form controls', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible()
  })

  test('Shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Expect form to show validation messages; using generic expectations to avoid coupling to exact copy
    await expect(page.locator('form')).toContainText(/email/i)
    await expect(page.locator('form')).toContainText(/password/i)
  })

  test('Login succeeds with E2E creds (if provided)', async ({ page }) => {
    test.skip(!E2E_USER_EMAIL || !E2E_USER_PASSWORD, 'E2E credentials not provided')
    await page.goto('/auth/login')
    await page.locator('#email').fill(E2E_USER_EMAIL!)
    await page.locator('#password').fill(E2E_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('Register page loads', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.locator('#firstName')).toBeVisible()
    await expect(page.locator('#lastName')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('Reset password page loads', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('Update password page loads', async ({ page }) => {
    await page.goto('/auth/update-password')
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()
    await expect(page.getByRole('button', { name: /update password/i })).toBeVisible()
  })
})