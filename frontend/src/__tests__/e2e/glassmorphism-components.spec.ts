import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Glassmorphism Components E2E Test Suite
 *
 * Comprehensive testing for all enhanced glassmorphism components:
 * - StatusBadge (4 variants with gradients and glass effects)
 * - Button (glass variant with hover animations)
 * - Dialog (glass overlay and content)
 * - Popover (medium glass effect)
 * - Dropdown Menu (glass background with menu items)
 * - Table (glass wrapper with alternating row transparency)
 *
 * Test Coverage:
 * 1. Visual rendering and glass effects
 * 2. Light and dark mode transitions
 * 3. Responsive behavior
 * 4. Accessibility (WCAG compliance)
 * 5. Component interactions
 * 6. Keyboard navigation
 */

test.describe('Glassmorphism Components', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test page with all glassmorphism components
    await page.goto('/test-components')
    // Wait for page to be fully loaded and hydrated
    await page.waitForLoadState('networkidle')
    // Wait for theme to be hydrated (Next.js theme flashing prevention)
    await page.waitForTimeout(100)
  })

  test.describe('StatusBadge Component', () => {
    test('should render all 4 status variants correctly', async ({ page }) => {
      // Verify all status badges are visible
      await expect(page.getByTestId('badge-pending')).toBeVisible()
      await expect(page.getByTestId('badge-approved')).toBeVisible()
      await expect(page.getByTestId('badge-rejected')).toBeVisible()
      await expect(page.getByTestId('badge-cancelled')).toBeVisible()
    })

    test('should display capitalized status text', async ({ page }) => {
      // Verify text is properly capitalized
      await expect(page.getByTestId('badge-pending')).toHaveText('Pending')
      await expect(page.getByTestId('badge-approved')).toHaveText('Approved')
      await expect(page.getByTestId('badge-rejected')).toHaveText('Rejected')
      await expect(page.getByTestId('badge-cancelled')).toHaveText('Cancelled')
    })

    test('should apply gradient backgrounds correctly', async ({ page }) => {
      // Check pending badge has warning gradient
      const pendingBadge = page.getByTestId('badge-pending')
      await expect(pendingBadge).toHaveCSS('background-image', /linear-gradient/)

      // Check approved badge has success gradient
      const approvedBadge = page.getByTestId('badge-approved')
      await expect(approvedBadge).toHaveCSS('background-image', /linear-gradient/)

      // Check rejected badge has danger gradient
      const rejectedBadge = page.getByTestId('badge-rejected')
      await expect(rejectedBadge).toHaveCSS('background-image', /linear-gradient/)
    })

    test('should apply backdrop blur for glass effect', async ({ page }) => {
      const badge = page.getByTestId('badge-pending')

      // Verify backdrop-filter is applied
      const backdropFilter = await badge.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      const badge = page.getByTestId('badge-pending')

      // Verify role="status"
      await expect(badge).toHaveAttribute('role', 'status')

      // Verify aria-label contains status text
      await expect(badge).toHaveAttribute('aria-label', /pending/i)
    })

    test('should display custom children when provided', async ({ page }) => {
      const customBadge = page.getByTestId('badge-pending-custom')
      await expect(customBadge).toHaveText('Awaiting Review')
    })

    test('should have focus indicator for keyboard navigation', async ({
      page,
    }) => {
      const badge = page.getByTestId('badge-pending')

      // Get initial outline
      const initialOutline = await badge.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('outline')
      )

      // Focus the badge
      await badge.focus()

      // Verify focus ring is applied
      const focusedOutline = await badge.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('outline')
      )

      // Should have focus-visible styles
      expect(focusedOutline).not.toBe(initialOutline)
    })
  })

  test.describe('Button Glass Variant', () => {
    test('should render glass variant button', async ({ page }) => {
      const glassButton = page.getByTestId('button-glass-default')
      await expect(glassButton).toBeVisible()
      await expect(glassButton).toHaveText('Glass Button')
    })

    test('should apply glass background and blur', async ({ page }) => {
      const glassButton = page.getByTestId('button-glass-default')

      // Check for glass-button class
      await expect(glassButton).toHaveClass(/glass-button/)

      // Verify backdrop-filter is applied
      const backdropFilter = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have hover effects (card-hover animation)', async ({
      page,
    }) => {
      const glassButton = page.getByTestId('button-glass-default')

      // Get initial transform
      const initialTransform = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('transform')
      )

      // Hover the button
      await glassButton.hover()

      // Wait for transition to complete
      await page.waitForTimeout(300)

      // Verify transform has changed (translateY)
      const hoverTransform = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('transform')
      )

      // Transform should change on hover
      expect(hoverTransform).not.toBe(initialTransform)
    })

    test('should handle click interactions correctly', async ({ page }) => {
      const glassButton = page.getByTestId('button-glass-default')

      // Verify button is clickable
      await glassButton.click()

      // Button should not navigate or cause errors
      await expect(page).toHaveURL(/test-components/)
    })

    test('should render different sizes correctly', async ({ page }) => {
      const smallButton = page.getByTestId('button-glass-sm')
      const defaultButton = page.getByTestId('button-glass-default')
      const largeButton = page.getByTestId('button-glass-lg')

      // All buttons should be visible
      await expect(smallButton).toBeVisible()
      await expect(defaultButton).toBeVisible()
      await expect(largeButton).toBeVisible()

      // Get heights to verify size differences
      const smallHeight = await smallButton.evaluate(
        (el) => el.getBoundingClientRect().height
      )
      const defaultHeight = await defaultButton.evaluate(
        (el) => el.getBoundingClientRect().height
      )
      const largeHeight = await largeButton.evaluate(
        (el) => el.getBoundingClientRect().height
      )

      // Verify size progression
      expect(smallHeight).toBeLessThan(defaultHeight)
      expect(defaultHeight).toBeLessThan(largeHeight)
    })

    test('should handle disabled state correctly', async ({ page }) => {
      const disabledButton = page.getByTestId('button-glass-disabled')

      // Verify disabled attribute
      await expect(disabledButton).toBeDisabled()

      // Verify reduced opacity
      const opacity = await disabledButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('opacity')
      )
      expect(parseFloat(opacity)).toBeLessThan(1)
    })
  })

  test.describe('Dialog Glassmorphism', () => {
    test('should open and close dialog correctly', async ({ page }) => {
      // Dialog should not be visible initially
      await expect(page.getByTestId('dialog-content')).not.toBeVisible()

      // Click trigger to open dialog
      await page.getByTestId('dialog-trigger').click()

      // Dialog should now be visible
      await expect(page.getByTestId('dialog-content')).toBeVisible()

      // Close dialog by pressing Escape
      await page.keyboard.press('Escape')

      // Dialog should be closed
      await expect(page.getByTestId('dialog-content')).not.toBeVisible()
    })

    test('should apply glass effect to overlay', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()

      // Get the overlay element
      const overlay = page.locator('[data-state="open"]').first()

      // Verify backdrop-filter is applied to overlay
      const backdropFilter = await overlay.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should apply glass effect to dialog content', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()

      const dialogContent = page.getByTestId('dialog-content')

      // Verify dialog-content class is applied
      await expect(dialogContent).toHaveClass(/dialog-content/)

      // Verify backdrop-filter is applied
      const backdropFilter = await dialogContent.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have proper dialog structure', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()

      // Verify all dialog parts are present
      await expect(page.getByTestId('dialog-title')).toBeVisible()
      await expect(page.getByTestId('dialog-description')).toBeVisible()
      await expect(page.getByTestId('dialog-confirm')).toBeVisible()
      await expect(page.getByTestId('dialog-cancel')).toBeVisible()
    })

    test('should trap focus inside dialog', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()

      // Tab through dialog elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Focus should stay within dialog
      const activeElement = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid')
      )
      expect(activeElement).toBeTruthy()
    })

    test('should close on close button click', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()
      await expect(page.getByTestId('dialog-content')).toBeVisible()

      // Click the X close button
      await page.locator('[aria-label="Close"]').click()

      // Dialog should be closed
      await expect(page.getByTestId('dialog-content')).not.toBeVisible()
    })
  })

  test.describe('Popover Glassmorphism', () => {
    test('should open and close popover correctly', async ({ page }) => {
      // Popover should not be visible initially
      await expect(page.getByTestId('popover-content')).not.toBeVisible()

      // Click trigger to open popover
      await page.getByTestId('popover-trigger').click()

      // Popover should now be visible
      await expect(page.getByTestId('popover-content')).toBeVisible()

      // Click outside to close popover
      await page.click('body', { position: { x: 0, y: 0 } })

      // Popover should be closed
      await expect(page.getByTestId('popover-content')).not.toBeVisible()
    })

    test('should apply medium glass effect', async ({ page }) => {
      // Open popover
      await page.getByTestId('popover-trigger').click()

      const popoverContent = page.getByTestId('popover-content')

      // Verify glass-popover class is applied
      await expect(popoverContent).toHaveClass(/glass-popover/)

      // Verify backdrop-filter is applied
      const backdropFilter = await popoverContent.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have proper popover content', async ({ page }) => {
      // Open popover
      await page.getByTestId('popover-trigger').click()

      // Verify popover content is present
      await expect(page.getByTestId('popover-title')).toBeVisible()
      await expect(page.getByTestId('popover-description')).toBeVisible()
    })

    test('should close on Escape key', async ({ page }) => {
      // Open popover
      await page.getByTestId('popover-trigger').click()
      await expect(page.getByTestId('popover-content')).toBeVisible()

      // Press Escape
      await page.keyboard.press('Escape')

      // Popover should be closed
      await expect(page.getByTestId('popover-content')).not.toBeVisible()
    })
  })

  test.describe('Dropdown Menu Glassmorphism', () => {
    test('should open and close dropdown correctly', async ({ page }) => {
      // Dropdown should not be visible initially
      await expect(page.getByTestId('dropdown-content')).not.toBeVisible()

      // Click trigger to open dropdown
      await page.getByTestId('dropdown-trigger').click()

      // Dropdown should now be visible
      await expect(page.getByTestId('dropdown-content')).toBeVisible()

      // Press Escape to close
      await page.keyboard.press('Escape')

      // Dropdown should be closed
      await expect(page.getByTestId('dropdown-content')).not.toBeVisible()
    })

    test('should apply glass background', async ({ page }) => {
      // Open dropdown
      await page.getByTestId('dropdown-trigger').click()

      const dropdownContent = page.getByTestId('dropdown-content')

      // Verify glass-dropdown class is applied
      await expect(dropdownContent).toHaveClass(/glass-dropdown/)

      // Verify backdrop-filter is applied
      const backdropFilter = await dropdownContent.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have all menu items', async ({ page }) => {
      // Open dropdown
      await page.getByTestId('dropdown-trigger').click()

      // Verify all menu items are present
      await expect(page.getByTestId('dropdown-label')).toBeVisible()
      await expect(page.getByTestId('dropdown-item-profile')).toBeVisible()
      await expect(page.getByTestId('dropdown-item-settings')).toBeVisible()
      await expect(page.getByTestId('dropdown-item-team')).toBeVisible()
      await expect(page.getByTestId('dropdown-item-logout')).toBeVisible()
    })

    test('should support keyboard navigation with arrow keys', async ({
      page,
    }) => {
      // Open dropdown
      await page.getByTestId('dropdown-trigger').click()

      // Navigate down with arrow key
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')

      // Verify focus has moved to a menu item
      const focusedElement = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid')
      )
      expect(focusedElement).toContain('dropdown-item')
    })

    test('should select menu item on Enter key', async ({ page }) => {
      // Open dropdown
      await page.getByTestId('dropdown-trigger').click()

      // Navigate to first item and press Enter
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')

      // Dropdown should close after selection
      await expect(page.getByTestId('dropdown-content')).not.toBeVisible()
    })

    test('should have hover states on menu items', async ({ page }) => {
      // Open dropdown
      await page.getByTestId('dropdown-trigger').click()

      const menuItem = page.getByTestId('dropdown-item-profile')

      // Get initial background
      const initialBg = await menuItem.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Hover the menu item
      await menuItem.hover()

      // Wait for transition
      await page.waitForTimeout(100)

      // Get hover background
      const hoverBg = await menuItem.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Background should change on hover
      expect(hoverBg).not.toBe(initialBg)
    })
  })

  test.describe('Table Glass Styling', () => {
    test('should render regular table without glass effects', async ({
      page,
    }) => {
      const regularTable = page.getByTestId('table-regular')
      await expect(regularTable).toBeVisible()

      // Regular table should not have table-glass class
      const hasGlassClass = await regularTable.evaluate((el) =>
        el.parentElement?.classList.contains('table-glass')
      )
      expect(hasGlassClass).toBe(false)
    })

    test('should render glass table with wrapper', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')
      await expect(glassTable).toBeVisible()

      // Glass table wrapper should have table-glass class
      const hasGlassClass = await glassTable.evaluate((el) =>
        el.parentElement?.classList.contains('table-glass')
      )
      expect(hasGlassClass).toBe(true)
    })

    test('should apply glass effects to table wrapper', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')

      // Get the wrapper element
      const wrapper = await glassTable.evaluateHandle((el) => el.parentElement)

      // Verify backdrop-filter is applied
      const backdropFilter = await wrapper.evaluate((el) =>
        window.getComputedStyle(el as Element).getPropertyValue('backdrop-filter')
      )
      expect(backdropFilter).toContain('blur')
    })

    test('should have glass header background', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')

      // Get the thead element
      const thead = glassTable.locator('thead')

      // Verify thead has glass background
      const background = await thead.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background')
      )
      expect(background).toBeTruthy()
    })

    test('should have alternating row transparency', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')

      // Get all body rows
      const rows = glassTable.locator('tbody tr')

      // Get background of first row (odd)
      const firstRowBg = await rows
        .nth(0)
        .evaluate((el) => window.getComputedStyle(el).getPropertyValue('background'))

      // Get background of second row (even)
      const secondRowBg = await rows
        .nth(1)
        .evaluate((el) => window.getComputedStyle(el).getPropertyValue('background'))

      // Backgrounds should be different (alternating transparency)
      expect(firstRowBg).not.toBe(secondRowBg)
    })

    test('should have hover effect on table rows', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')
      const firstRow = glassTable.locator('tbody tr').first()

      // Get initial background
      const initialBg = await firstRow.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Hover the row
      await firstRow.hover()

      // Wait for transition
      await page.waitForTimeout(200)

      // Get hover background
      const hoverBg = await firstRow.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Background should change on hover
      expect(hoverBg).not.toBe(initialBg)
    })
  })

  test.describe('Dark Mode Transitions', () => {
    test('should toggle theme correctly', async ({ page }) => {
      // Initial theme detection
      const initialTheme = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )

      // Click theme toggle
      await page.getByTestId('theme-toggle').click()

      // Wait for theme transition
      await page.waitForTimeout(300)

      // Theme should have changed
      const newTheme = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(newTheme).not.toBe(initialTheme)
    })

    test('should update StatusBadge gradients in dark mode', async ({
      page,
    }) => {
      // Get initial gradient
      const badge = page.getByTestId('badge-approved')
      const lightGradient = await badge.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-image')
      )

      // Toggle to dark mode
      await page.getByTestId('theme-toggle').click()
      await page.waitForTimeout(300)

      // Get dark mode gradient
      const darkGradient = await badge.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-image')
      )

      // Gradients should be different in dark mode
      expect(darkGradient).not.toBe(lightGradient)
    })

    test('should update glass effects in dark mode', async ({ page }) => {
      const glassButton = page.getByTestId('button-glass-default')

      // Get light mode background
      const lightBg = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Toggle to dark mode
      await page.getByTestId('theme-toggle').click()
      await page.waitForTimeout(300)

      // Get dark mode background
      const darkBg = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('background-color')
      )

      // Backgrounds should be different
      expect(darkBg).not.toBe(lightBg)
    })

    test('should update theme toggle icon', async ({ page }) => {
      // Check initial icon
      const initialIcon = await page
        .getByTestId('theme-toggle')
        .locator('svg')
        .first()
        .getAttribute('data-testid')

      // Toggle theme
      await page.getByTestId('theme-toggle').click()
      await page.waitForTimeout(300)

      // Check new icon
      const newIcon = await page
        .getByTestId('theme-toggle')
        .locator('svg')
        .first()
        .getAttribute('data-testid')

      // Icon should change
      expect(newIcon).not.toBe(initialIcon)
    })
  })

  test.describe('Accessibility Compliance', () => {
    test('should pass axe accessibility scan on light mode', async ({
      page,
    }) => {
      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Should have no violations
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should pass axe accessibility scan on dark mode', async ({
      page,
    }) => {
      // Toggle to dark mode
      await page.getByTestId('theme-toggle').click()
      await page.waitForTimeout(300)

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Should have no violations
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have visible focus indicators', async ({ page }) => {
      const focusTestButton = page.getByTestId('focus-test-1')

      // Focus the button
      await focusTestButton.focus()

      // Check for focus-visible styles
      const outline = await focusTestButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('outline')
      )
      expect(outline).not.toBe('none')
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Focus should be on an interactive element
      const activeElement = await page.evaluate(
        () => document.activeElement?.tagName
      )
      expect(['BUTTON', 'A', 'INPUT']).toContain(activeElement)
    })

    test('should have proper color contrast', async ({ page }) => {
      // Run axe scan specifically for color contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('[data-testid]')
        .analyze()

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast'
      )

      // Should have no color contrast violations
      expect(contrastViolations).toEqual([])
    })

    test('should have semantic HTML structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1Count = await page.locator('h1').count()
      const h2Count = await page.locator('h2').count()

      // Should have one h1 and multiple h2s
      expect(h1Count).toBe(1)
      expect(h2Count).toBeGreaterThan(0)
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // All sections should still be visible
      await expect(page.getByTestId('status-badge-section')).toBeVisible()
      await expect(page.getByTestId('button-glass-section')).toBeVisible()
      await expect(page.getByTestId('dialog-section')).toBeVisible()
    })

    test('should reduce blur on mobile for performance', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      const glassButton = page.getByTestId('button-glass-default')

      // Get backdrop-filter blur value
      const backdropFilter = await glassButton.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('backdrop-filter')
      )

      // Blur should be present (even if reduced)
      expect(backdropFilter).toContain('blur')
    })

    test('should adapt to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      // All components should be visible and functional
      await expect(page.getByTestId('table-glass')).toBeVisible()
      await expect(page.getByTestId('button-glass-default')).toBeVisible()
    })

    test('should handle desktop viewport correctly', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })

      // All components should be visible
      await expect(page.getByTestId('page-title')).toBeVisible()
      await expect(page.getByTestId('accessibility-section')).toBeVisible()
    })
  })

  test.describe('Visual Regression', () => {
    test('should match StatusBadge snapshots in light mode', async ({
      page,
    }) => {
      const section = page.getByTestId('status-badge-section')

      // Take screenshot of status badges
      await expect(section).toHaveScreenshot('status-badges-light.png', {
        maxDiffPixels: 100,
      })
    })

    test('should match StatusBadge snapshots in dark mode', async ({
      page,
    }) => {
      // Toggle to dark mode
      await page.getByTestId('theme-toggle').click()
      await page.waitForTimeout(300)

      const section = page.getByTestId('status-badge-section')

      // Take screenshot of status badges
      await expect(section).toHaveScreenshot('status-badges-dark.png', {
        maxDiffPixels: 100,
      })
    })

    test('should match Button glass variant snapshots', async ({ page }) => {
      const section = page.getByTestId('button-glass-section')

      // Take screenshot
      await expect(section).toHaveScreenshot('button-glass-light.png', {
        maxDiffPixels: 100,
      })
    })

    test('should match Dialog glassmorphism snapshots', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()

      const dialog = page.getByTestId('dialog-content')

      // Take screenshot
      await expect(dialog).toHaveScreenshot('dialog-glass-light.png', {
        maxDiffPixels: 100,
      })
    })

    test('should match Table glass styling snapshots', async ({ page }) => {
      const glassTable = page.getByTestId('table-glass')

      // Scroll table into view
      await glassTable.scrollIntoViewIfNeeded()

      // Take screenshot
      await expect(glassTable).toHaveScreenshot('table-glass-light.png', {
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Performance', () => {
    test('should render components within acceptable time', async ({
      page,
    }) => {
      const startTime = Date.now()

      // Navigate and wait for load
      await page.goto('/test-components')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should not cause layout shifts', async ({ page }) => {
      // Monitor for layout shifts
      const layoutShifts = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let cumulativeScore = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift') {
                cumulativeScore += (entry as any).value
              }
            }
          }).observe({ type: 'layout-shift', buffered: true })

          // Wait 2 seconds then resolve
          setTimeout(() => resolve(cumulativeScore), 2000)
        })
      })

      // Cumulative Layout Shift should be low (< 0.1 is good)
      expect(layoutShifts).toBeLessThan(0.1)
    })

    test('should have smooth animations at 60fps', async ({ page }) => {
      const glassButton = page.getByTestId('button-glass-default')

      // Measure animation frame rate
      const frameRate = await glassButton.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0
          const startTime = performance.now()

          function countFrames() {
            frames++
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames)
            } else {
              resolve(frames)
            }
          }

          requestAnimationFrame(countFrames)
        })
      })

      // Should have close to 60 fps (allow some variance)
      expect(frameRate).toBeGreaterThan(50)
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle rapid theme toggling', async ({ page }) => {
      // Toggle theme rapidly
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('theme-toggle').click()
        await page.waitForTimeout(50)
      }

      // Page should still be functional
      await expect(page.getByTestId('page-title')).toBeVisible()
    })

    test('should handle multiple dialogs opening', async ({ page }) => {
      // Open dialog
      await page.getByTestId('dialog-trigger').click()
      await expect(page.getByTestId('dialog-content')).toBeVisible()

      // Close dialog
      await page.keyboard.press('Escape')

      // Open again
      await page.getByTestId('dialog-trigger').click()
      await expect(page.getByTestId('dialog-content')).toBeVisible()
    })

    test('should handle window resize correctly', async ({ page }) => {
      // Start with desktop size
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Verify component is visible
      await expect(page.getByTestId('button-glass-default')).toBeVisible()

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 })

      // Component should still be visible
      await expect(page.getByTestId('button-glass-default')).toBeVisible()
    })

    test('should handle prefers-reduced-motion', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' })

      // Navigate to page
      await page.goto('/test-components')
      await page.waitForLoadState('networkidle')

      // Components should still render
      await expect(page.getByTestId('button-glass-default')).toBeVisible()

      // Animations should be disabled (check transition duration)
      const transitionDuration = await page
        .getByTestId('button-glass-default')
        .evaluate((el) =>
          window.getComputedStyle(el).getPropertyValue('transition-duration')
        )

      // Transition duration should be minimal
      expect(parseFloat(transitionDuration)).toBeLessThan(0.1)
    })
  })
})
