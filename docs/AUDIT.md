# LEAVE-MANAGEMENT Project Audit Log

Date: 2025-10-15

This document records the recent troubleshooting, fixes, and findings carried out in the LEAVE-MANAGEMENT project to stabilize the frontend build and validate core flows via Playwright.

## Overview

- Frontend framework: Next.js
- Styling: TailwindCSS with PostCSS
- Auth & data: Supabase (auth-helpers for Next.js)
- E2E testing: Playwright (@playwright/test)

## Fixes Applied

1) PostCSS configuration corrected
   - File: `frontend/postcss.config.js`
   - Change: Switched PostCSS plugins to the object mapping format using `'@tailwindcss/postcss': {}` to resolve Next.js build-time errors:
     - "Malformed PostCSS Configuration"
     - "Your custom PostCSS configuration must export a `plugins` key"
   - Result: Dev server compiles and runs. UI loads without PostCSS configuration errors.

2) Supabase client migration (deprecation cleanup)
   - Files updated:
     - `frontend/src/lib/supabase/client.ts`: replace `createBrowserSupabaseClient` with `createPagesBrowserClient`.
     - `frontend/src/lib/session.ts`: replace `supabase.auth.getSession()` with `supabase.auth.getUser()`.
     - `frontend/src/lib/auth/auth-context.tsx`: replace initial user retrieval via `getSession()` with `getUser()`.
     - `frontend/src/components/auth/auth-provider.tsx`: replace initial user retrieval via `getSession()` with `getUser()` and align employee fetch accordingly.
   - Reason: Address console warnings about deprecated Supabase helpers and modernize auth retrieval.

3) Playwright test runner installed
   - Added dev dependency: `@playwright/test`
   - Purpose: Enable writing and running E2E tests for authentication, dashboard, admin, and role-specific flows.

4) E2E tests created (initial draft)
   - Files:
     - `frontend/src/__tests__/e2e/employee.spec.ts`
     - `frontend/src/__tests__/e2e/manager.spec.ts`
     - `frontend/src/__tests__/e2e/hr.spec.ts`
     - `frontend/src/__tests__/e2e/admin.spec.ts`
   - Scope: Basic smoke tests for login, dashboard, and navigation to key pages per role.

## Findings During Verification

- Supabase deprecation warnings observed for legacy helpers and session retrieval (addressed via migration above).
- Backend RLS policy error on `employees` relation:
  - Status: `500`
  - Code: `42P17`
  - Message: "infinite recursion detected in policy for relation 'employees'"
  - Impact: Employee data fetch fails; dependent UI states may show loading or error.
- Documents page (`/dashboard/documents`) shows client-side error:
  - Error: `No QueryClient set` (React Query)
  - Cause: Missing `QueryClientProvider` wrapper on the page/component.
- Approvals route missing:
  - `/dashboard/approvals` returns 404.
  - Impact: Manager/HR approval workflows inaccessible.
- Admin users page (`/dashboard/admin/users`) error:
  - Error: `useAuth must be used within an AuthProvider`
  - Cause: Page component tree not wrapped with `AuthProvider`.

## Next Actions (Approved)

1) Execute E2E tests for authentication flows
   - Login, Register, Reset Password, Update Password.

2) Execute dashboard functionality tests
   - Navigation, Leaves, Approvals, Documents, Calendar.

3) Execute admin functionality tests
   - User management, Roles, Audit logs.

4) Fix Documents page
   - Wrap with `QueryClientProvider` to resolve "No QueryClient set".

5) Investigate and fix backend RLS policy for `employees`
   - Remove recursive policy logic; ensure role-based access without circular references.

6) Supabase deprecation migration (remaining)
   - Audit codebase for any lingering `createBrowserSupabaseClient` or session-dependent patterns; standardize on `createPagesBrowserClient` and `supabase.auth.getUser()`.

7) Implement `/dashboard/approvals` route
   - Provide UI and data fetching for approvals workflows.

## Notes

- After each change that affects UI, open and verify the running dev server at `http://localhost:3000` before marking tasks complete.
- Maintain AuthProvider and React Query providers at page/layout level to prevent context-related runtime errors.

---
Maintained by: Engineering

## 2025-10-15 — Backend RLS recursion fix implemented (pending migration)

Context:
- Playwright MCP and local logs indicated 42P17 errors (policy recursion) when querying `public.employees`, causing backend 500 responses.
- Existing policies included a manager department access rule that self-joined `employees` and could recurse under RLS.

Actions taken:
- Added new migration at `supabase/migrations/011_fix_employees_rls_recursion.sql` to remove recursion and introduce a safe helper:
  - Created `public.get_current_user_department()` (SECURITY DEFINER, STABLE, safe search_path; granted EXECUTE to anon/authenticated) to fetch the current user’s department without triggering RLS recursion.
  - Replaced the recursive `employees_department_access` policy with a non-recursive check:
    - `USING ( get_user_role() IN ('manager','admin','hr') AND employees.department = public.get_current_user_department() )`
  - Left existing self-access and admin/HR policies intact.

Migration steps (to apply locally):
- Ensure Supabase CLI is installed and the local stack is running.
- From repo root:
  1) supabase stop
  2) supabase start
  3) supabase db reset --use-mig-dir supabase/migrations
     - Alternatively: supabase db migrate

Post-migration validation checklist:
- Manager role: can SELECT employees in the same department; cannot access other departments.
- Admin/HR roles: retain full SELECT access.
- Employee (non-manager): can SELECT only self.
- No more 42P17 recursion errors in logs; endpoints return 200/403 appropriately.

UI verification:
- Wrapped global app with `AppProviders` (AuthProvider + ThemeProvider + QueryClientProvider). Verified:
  - /dashboard/approvals route renders (removes prior 404).
  - /dashboard/documents loads without React Query context errors.

Next:
- Run E2E suites (auth, dashboard, admin) and stabilize any failures.
- Monitor console for residual Supabase deprecation warnings; confirm `createPagesBrowserClient` and `auth.getUser()` migrations resolved them.