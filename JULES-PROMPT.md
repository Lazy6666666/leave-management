# Jules Actionable Prompt: Leave Management System Finalization

This document outlines the remaining tasks to get the Leave Management System ready for production. The project is feature-complete according to the PRD, but requires environment stabilization, testing, and hardening.

---

### Phase 1: Stabilize the Development and Testing Environment

**Goal:** Create a stable and reliable local environment for development and testing. This is the highest priority and blocks all other progress.

1.  **Diagnose and Fix Supabase Local Environment:**
    *   Investigate and resolve the Docker permission issues that are preventing the Supabase CLI from running.
    *   Ensure the `supabase/config.toml` is correctly configured.
    *   Successfully run `supabase start` to launch the local development stack.
    *   Successfully run `supabase db reset` to apply all database migrations.

2.  **Resolve Frontend Unit Testing Setup:**
    *   Restore the `frontend/postcss.config.js` file to its original state.
    *   Debug the PostCSS/tailwindcss/lightningcss dependency issues to allow `vitest` to run without errors.
    *   Successfully execute the unit test located at `frontend/src/__tests__/dashboard-stats.test.tsx`.

3.  **Fix Playwright E2E Test Setup:**
    *   Diagnose and fix the timeout issue that is preventing the Playwright web server from starting.
    *   Ensure the `.env.test` file is being loaded correctly by the Playwright configuration.
    *   Successfully run the E2E test for submitting a leave request located at `frontend/src/__tests__/e2e/submit-leave-request.spec.ts`.

---

### Phase 2: Complete and Refine Feature Implementation

**Goal:** Flesh out all stubbed UI components and connect all user actions.

1.  **Implement `TODO` Functionality:**
    *   **Profile Page:** Implement the "Change Photo" functionality.
    *   **User Management:** Implement the "Edit" and "Deactivate" (Trash2 icon) functionality in the `UserManagementTable` component.
    *   **Leave Policy Management:** Implement the "Add Leave Type", "Edit", and "Deactivate" functionality in the `LeavePolicyManagement` component.
    *   **Team Calendar:** Add modifiers to the calendar to highlight leave days and display leave details for the selected date.

2.  **Connect UI Actions:**
    *   Wire up the "Quick Actions" buttons on the employee dashboard ("Submit Leave Request", "View Leave History", "Team Calendar") to navigate to their respective pages.

3.  **Improve User Experience:**
    *   Add loading spinners and disabled states to all forms during submission to provide better user feedback.
    *   Ensure error messages are consistently displayed to the user using the `toast` component.

---

### Phase 3: Comprehensive Testing and Validation

**Goal:** Achieve the test coverage and quality standards outlined in the PRD.

1.  **Expand Unit Test Coverage (Vitest):**
    *   Write unit tests for all form validation schemas (Zod).
    *   Write unit tests for any utility or helper functions.
    *   Write unit tests for data transformation logic within components.

2.  **Expand E2E Test Suite (Playwright):**
    *   Create an E2E test for the full manager workflow: logging in as a manager and approving or rejecting a pending leave request.
    *   Create an E2E test for the admin workflow of creating a new user.
    *   Create an E2E test for the admin workflow of creating a new leave policy.

---

### Phase 4: Production Hardening and Deployment

**Goal:** Prepare the application for a secure and reliable production deployment.

1.  **Implement Sentry Monitoring:**
    *   Install and configure the Sentry Next.js SDK in the frontend application.
    *   Ensure that runtime errors are being captured and sent to a Sentry project.

2.  **Conduct Security and Dependency Audit:**
    *   Run `npm audit fix` to address any resolvable dependency vulnerabilities.
    *   Manually review and address the remaining vulnerabilities.
    *   Perform a final review of all Row-Level Security (RLS) policies in `supabase/combined_migrations.sql` to ensure they are secure and comprehensive.

3.  **Finalize and Verify CI/CD Pipeline:**
    *   Ensure the `test` and `test:e2e` jobs in the `.github/workflows/ci-cd.yml` file run successfully.
    *   Set up the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets in the GitHub repository to enable deployments to Vercel.
    *   Trigger a deployment to Vercel by pushing to the `main` branch and verify that it completes successfully.
