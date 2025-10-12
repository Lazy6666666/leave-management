# Testing Strategies Best Practices

## Table of Contents
- [Testing Architecture](#testing-architecture)
- [Unit Testing (Vitest)](#unit-testing-vitest)
- [Integration Testing](#integration-testing)
- [E2E Testing (Playwright MCP)](#e2e-testing-playwright-mcp)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)
- [Test Data Management](#test-data-management)
- [CI/CD Integration](#cicd-integration)
- [MCP Integration](#mcp-integration)

## Testing Architecture

### Testing Pyramid Strategy
- **Unit Tests (70%)**: Individual functions, utilities, business logic
- **Integration Tests (20%)**: API routes, database operations, external services
- **E2E Tests (10%)**: Complete user workflows, critical paths

### Test Organization
- `src/__tests__/unit/` - Unit tests for utilities and business logic
- `src/__tests__/integration/` - API route tests, database operations
- `src/__tests__/e2e/` - Playwright E2E tests
- `src/__tests__/utils/` - Test utilities, factories, mocks

## Unit Testing (Vitest)

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Testing Patterns
- **Arrange-Act-Assert (AAA)** pattern for all tests
- **Factory functions** for creating test data
- **Custom render functions** for React component testing
- **Mock external dependencies** (Supabase, API calls)

### Business Logic Testing
- Date calculation utilities (business days, leave balances)
- Form validation schemas (Zod)
- Permission checking functions
- Data transformation utilities

## Integration Testing

### API Route Testing
- Test Next.js API routes with mocked Supabase clients
- Validate request/response schemas
- Test authentication and authorization middleware
- Mock external service calls (SendGrid, storage)

### Database Testing
- Use test database instances for integration tests
- Test RLS policies with different user roles
- Validate data consistency and referential integrity
- Test database triggers and functions

## E2E Testing (Playwright MCP)

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

### Critical E2E Flows
- **Authentication Flow**: Signup → Login → Profile setup
- **Leave Request Flow**: Create → Submit → Approval → Status update
- **Admin Operations**: User management → Role assignment → Permission validation
- **Document Management**: Upload → Expiry notification → Renewal
- **Calendar Integration**: View team calendar → Click date details → Modal display

### Playwright MCP Integration
- Use MCP for dynamic test data generation
- Implement model-driven test assertions
- Generate test scenarios from user stories
- Automated visual regression testing

## Accessibility Testing

### Axe-Core Integration
```typescript
// accessibility.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('dashboard is accessible', async ({ page }) => {
    await page.goto('/dashboard')
    await checkA11y(page, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
      },
    })
  })
})
```

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Visible focus indicators and logical tab order
- **Alternative Text**: Descriptive alt text for images

## Performance Testing

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Performance Testing Tools
- Lighthouse CI for automated performance monitoring
- WebPageTest for detailed performance analysis
- Bundle analyzer for JavaScript bundle optimization

## Test Data Management

### Test Data Strategy
- **Factories**: Create realistic test data with Factory pattern
- **Seeders**: Database seeding scripts for consistent test environments
- **Anonymization**: Remove PII from test data
- **Cleanup**: Proper test data cleanup between test runs

### Test Database Management
- Separate test database instances
- Automated database migrations for tests
- Test data rollback after test completion
- Realistic but anonymized test datasets

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type checking
        run: npm run type-check
      - name: Run unit tests
        run: npm run test:unit
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Run accessibility tests
        run: npm run test:a11y
```

### Pre-commit Hooks
- Lint and type checking before commits
- Unit tests for changed files
- Security scanning for dependencies

## MCP Integration

### Playwright MCP Features
- Dynamic test scenario generation
- Model-driven assertions and validations
- Automated test data creation
- Intelligent test failure analysis

### Testing Best Practices with MCP
- Use MCP for generating edge case scenarios
- Implement model-driven accessibility testing
- Generate performance test scenarios
- Automated test documentation generation

### MCP Test Patterns
```typescript
// Example MCP-enhanced test
test('leave request approval flow', async ({ page }) => {
  // Use MCP to generate realistic test data
  const testData = await mcp.generateTestData('leave_request_scenario')

  // Navigate and interact
  await page.goto('/dashboard/leaves/new')
  await page.fill('[data-testid="start-date"]', testData.startDate)
  await page.fill('[data-testid="reason"]', testData.reason)

  // MCP-driven assertions
  await mcp.assertValidLeaveRequest(page, testData)
})
```

## Test Reporting and Monitoring

### Test Reporting
- HTML reports for E2E tests
- Coverage reports for unit tests
- Accessibility violation reports
- Performance regression reports

### Monitoring Integration
- Test failure notifications to Slack/Teams
- Performance regression alerts
- Coverage decrease notifications
- Flaky test detection and alerts

## Best Practices Summary

### Testing Guidelines
- Write tests before implementing features (TDD when possible)
- Keep tests fast, isolated, and repeatable
- Use descriptive test names that explain the behavior being tested
- Mock external dependencies appropriately
- Test both happy path and edge cases
- Maintain test data consistency across test suites

### Quality Gates
- All tests must pass before merging to main
- Minimum test coverage thresholds (80% for new code)
- Accessibility compliance for all new UI components
- Performance budgets for page load times
