
**Commands for Development:**
*   `npm install`
*   `npm run dev` (frontend)
*   `cd frontend && npm run dev` (frontend)
*   `cd backend && npm run dev` (backend)
*   `npm run test` (unit tests with Vitest)
*   `npm run test:e2e` (E2E tests with Playwright)
*   `npm run type-check` (TypeScript type checking)
*   `npm run lint` (ESLint)
*   `npm run validate-structure` (repository structure validation)

**What to do when a task is completed:**
*   Run `npm run lint`.
*   Run `npm run type-check`.
*   Run `npm run test` (unit tests).
*   Run `npm run test:e2e` (E2E tests).
*   Ensure `npm run validate-structure` passes.
*   For CI/CD, ensure GitHub Actions workflow passes.
