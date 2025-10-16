# Glassmorphism E2E Tests - Quick Start Guide

## Files Created

### 1. Test Page
**`frontend/src/app/test-components/page.tsx`**
- Comprehensive test page with all glassmorphism components
- Includes StatusBadge, Button, Dialog, Popover, Dropdown, Table
- Has theme toggle for dark mode testing
- Fully accessible with ARIA attributes

### 2. Test Suite
**`frontend/src/__tests__/e2e/glassmorphism-components.spec.ts`**
- 60+ test cases covering all components
- Accessibility tests with @axe-core/playwright
- Visual regression tests with screenshots
- Performance tests (load time, FPS, CLS)
- Dark mode transition tests
- Responsive behavior tests

### 3. Documentation
**`frontend/tests/e2e/GLASSMORPHISM-TESTS-README.md`**
- Complete test documentation
- Test coverage breakdown
- Running instructions
- Debugging guide
- Best practices

## Quick Run

### 1. Start Dev Server
```bash
cd frontend
npm run dev
```

### 2. Run Tests (in another terminal)
```bash
cd frontend

# Run all glassmorphism tests
npx playwright test glassmorphism-components.spec.ts

# Run in UI mode (recommended for first run)
npx playwright test glassmorphism-components.spec.ts --ui

# Run specific browser
npx playwright test glassmorphism-components.spec.ts --project=chromium
```

### 3. View Results
```bash
npx playwright show-report
```

## Test Page URL

Navigate to: **http://localhost:3000/test-components**

## Key Test Selectors

All components have `data-testid` attributes:

**StatusBadge:**
- `badge-pending`
- `badge-approved`
- `badge-rejected`
- `badge-cancelled`

**Button:**
- `button-glass-default`
- `button-glass-sm`
- `button-glass-lg`
- `button-glass-disabled`

**Dialog:**
- `dialog-trigger`
- `dialog-content`
- `dialog-title`
- `dialog-description`

**Popover:**
- `popover-trigger`
- `popover-content`

**Dropdown:**
- `dropdown-trigger`
- `dropdown-content`
- `dropdown-item-[name]`

**Table:**
- `table-regular`
- `table-glass`

**Theme:**
- `theme-toggle`

## Test Categories

### 1. Component Tests (33 tests)
- StatusBadge (7 tests)
- Button (6 tests)
- Dialog (6 tests)
- Popover (4 tests)
- Dropdown (6 tests)
- Table (6 tests)

### 2. Theme Tests (4 tests)
- Toggle functionality
- Gradient updates
- Glass effect updates
- Icon changes

### 3. Accessibility (6 tests)
- Axe scans (light/dark)
- Focus indicators
- Keyboard navigation
- Color contrast
- Semantic HTML

### 4. Responsive (4 tests)
- Mobile (375×667)
- Tablet (768×1024)
- Desktop (1920×1080)
- Blur optimization

### 5. Visual Regression (5 tests)
- StatusBadge snapshots
- Button snapshots
- Dialog snapshots
- Table snapshots
- Dark mode snapshots

### 6. Performance (3 tests)
- Load time (<3s)
- Layout stability (CLS <0.1)
- Animation FPS (>50fps)

### 7. Edge Cases (4 tests)
- Rapid theme toggling
- Multiple dialogs
- Window resize
- Reduced motion

## Common Commands

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all tests
npx playwright test glassmorphism-components.spec.ts

# Run in headed mode (see browser)
npx playwright test glassmorphism-components.spec.ts --headed

# Run specific test
npx playwright test glassmorphism-components.spec.ts -g "StatusBadge"

# Update visual regression baselines
npx playwright test glassmorphism-components.spec.ts --update-snapshots

# Debug mode
npx playwright test glassmorphism-components.spec.ts --debug

# Generate HTML report
npx playwright test glassmorphism-components.spec.ts --reporter=html

# View report
npx playwright show-report
```

## Test Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── test-components/
│   │       └── page.tsx           ← Test page
│   └── __tests__/
│       └── e2e/
│           └── glassmorphism-components.spec.ts  ← Test suite
├── tests/
│   └── e2e/
│       ├── GLASSMORPHISM-TESTS-README.md  ← Full docs
│       └── QUICK-START.md         ← This file
└── playwright.config.ts           ← Playwright config
```

## Success Criteria

All tests should pass with:
- ✅ 0 accessibility violations
- ✅ All visual regression tests match baselines
- ✅ Load time <3 seconds
- ✅ No layout shifts (CLS <0.1)
- ✅ Smooth animations (>50 FPS)
- ✅ All components render in light/dark mode
- ✅ All keyboard navigation works
- ✅ All responsive breakpoints work

## Troubleshooting

**Tests timeout:**
- Ensure dev server is running on port 3000
- Check `npm run dev` is active

**Visual regression fails:**
- Review screenshots in `test-results/`
- Update snapshots if changes are intentional: `--update-snapshots`

**Accessibility violations:**
- Check HTML report for details
- Fix ARIA attributes or color contrast

**Type errors:**
- Run `npm run typecheck` to find TypeScript issues
- Fix any import errors or type mismatches

## Next Steps

1. **Run initial test:** `npx playwright test glassmorphism-components.spec.ts --ui`
2. **Review results:** Check HTML report
3. **Update snapshots:** `--update-snapshots` if needed
4. **Integrate CI/CD:** Add to GitHub Actions workflow
5. **Maintain tests:** Update when components change

## Contact

For issues or questions about the test suite, see:
- Full documentation: `GLASSMORPHISM-TESTS-README.md`
- Playwright docs: https://playwright.dev/
- Axe-core docs: https://github.com/dequelabs/axe-core

---

**Total Lines of Test Code:** ~1,100
**Total Test Cases:** 60+
**Coverage:** 6 components, light/dark modes, accessibility, performance
**Time to Run:** ~2-3 minutes (all browsers)
