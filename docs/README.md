# Leave Management — Modern Web Application

A production-grade, full-stack Next.js + Supabase application for managing employee leaves, approvals, documents, and administrative workflows.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Frontend](#2-frontend)
- [3. Backend (Supabase)](#3-backend-supabase)
- [4. Auth & Authorization](#4-auth--authorization)
- [5. RLS Policies](#5-rls-policies)
- [6. Storage](#6-storage)
- [7. Notifications & Cronjobs](#7-notifications--cronjobs)
- [8. Styling & Theming](#8-styling--theming)
- [9. Frontend + Backend Integration](#9-frontend--backend-integration)
- [10. Deployment](#10-deployment)
- [11. Testing](#11-testing)
- [12. Code Quality & Tooling](#12-code-quality--tooling)
- [13. Monitoring & Logging](#13-monitoring--logging)
- [14. External Integrations](#14-external-integrations)
- [15. Local Development & Contributing](#15-local-development--contributing)
- [16. Performance Optimizations](#16-performance-optimizations)
- [17. SEO / Meta Tags](#17-seo--meta-tags)
- [18. FAQ or Common Pitfalls](#18-faq-or-common-pitfalls)

---

## 1. Project Overview

- Project name: Leave Management
- One-liner: A secure, role-based leave management platform with dashboards for employees, managers, HR, and admins.
- Goals:
  - Provide frictionless leave requests and approvals
  - Offer role-aware dashboards and reporting
  - Secure data access via Supabase RLS (Row-Level Security)
  - Support document uploads, team calendars, and admin user management
- Tech stack:
  - Frontend: Next.js (App Router) + TypeScript, TailwindCSS, shadcn/ui, Playwright, Vitest
  - Backend: Supabase (Postgres, Auth, Storage), RLS policies, Edge Functions (optional)
  - Database: PostgreSQL on Supabase
  - Auth: Supabase Auth (Email/Password; SSO providers optional)
  - Hosting: Vercel (frontend), Supabase (backend)
  - CI/CD: GitHub Actions

---

## 2. Frontend

- Framework: Next.js 15 + TypeScript
- Key pages:
  - `/auth/login` — authentication
  - `/dashboard` — role-aware dashboard
  - `/dashboard/approvals` — approvals workflow for HR/managers
  - `/dashboard/documents` — documents management (upload/export/search)
  - `/dashboard/admin/users` — user management (admin)
  - `/dashboard/leaves` — leaves page for employees
- Folder structure (frontend/):
  - `src/app` — Next.js routes, layouts, pages
  - `src/components` — reusable UI components (prefer shadcn/ui)
  - `src/hooks` — custom hooks (e.g., useAuth, useQuery wrappers)
  - `src/lib` — Supabase client, utilities
  - `src/types` — shared TypeScript types
  - `src/config` — app configuration/constants
  - `src/__tests__` — E2E specs and unit tests
- Important imports/types/hooks:
  - Supabase client (`src/lib/supabaseClient.ts`)
  - Query client/provider (React Query via AppProviders)
  - Auth provider (`AuthProvider`) for session context
  - Reusable types: `User`, `Employee`, `LeaveRequest`, `Document`
- Routing & protected routes:
  - Middleware (`src/app/middleware.ts`) enforces auth on `/dashboard/*`
  - Public routes: `/`, `/auth/*`
  - Auth guards: redirect to `/auth/login` when session is absent
- State management:
  - React Query for data fetching & caching
  - Local component state with hooks
- Dark/light mode:
  - next-themes + TailwindCSS `darkMode: 'class'`
  - ThemeProvider at root layout; components use `bg-background text-foreground`
- UI library:
  - shadcn/ui components (Button, Card, Input, Dialog, Select, Sheet, Dropdown, Toast)
- Tailwind & theme tokens:
  - Custom CSS variables via `globals.css`: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, etc.
  - Dark tokens under `.dark` selector; use `bg-background` and `text-foreground` classes throughout

---

## 3. Backend (Supabase)

- Database structure:
  - Core tables: `profiles`, `employees`, `leaves`, `documents`, `departments`, `teams`
  - Policies and functions defined via migrations in `supabase/migrations`
- Supabase project setup:
  - Refer to `supabase/.temp/project-ref` for current project reference
  - Environment variables used by frontend Supabase client
- Key functions/types:
  - `get_user_role()` — returns `employee | manager | hr | admin`
  - `get_current_user_department()` — helper to avoid recursive policies
- Edge Functions (optional):
  - Implement background tasks (notifications, scheduled jobs) if needed
- APIs/RPCs:
  - Use Supabase RPC for specialized queries; otherwise standard table queries via Supabase JS client
- Frontend integration:
  - Supabase client configured with URL + anon key via env
  - React Query hooks wrap Supabase calls; handle loading and errors uniformly

---

## 4. Auth & Authorization

- Supabase Auth setup:
  - Email/password enabled; social providers optional (Google, GitHub)
- Auth flow:
  - Login -> session -> middleware redirect to `/dashboard`
  - Password reset: Supabase magic links
- RBAC:
  - Roles: `employee`, `manager`, `hr`, `admin`
  - Enforced via RLS policies and frontend guards
- Auth guards:
  - Middleware and components check `session`/`role`
- Session management:
  - Supabase client auto-refreshes tokens; frontend subscribes to auth state changes

---

## 5. RLS Policies

- Role definitions: See above
- Table policies (examples):
  - `employees`: access scoped by department via `get_current_user_department()`
  - `leaves`: employees can read/write own; managers/HR can read team; admin full access
  - `documents`: creator & team access; admin/HR broader read
- Example rules:
  - Employees: `auth.uid() = employees.user_id`
  - Managers: `employees.department = get_current_user_department()`
- Enforcement:
  - Frontend queries respect RLS; no bypass
  - Use server-side API only for admin-level operations

---

## 6. Storage

- Buckets:
  - `avatars` (public/controlled)
  - `public.documents` (private; role-based access)
  - 'corporate.documents' (private: admin and hr only access)
- Use cases:
  - 'public.documents' (Profile pictures, uploaded leave-related documents )
  - 'corporate.documents' (company/employee related documents that comes with expiration dates)
- Access control:
  - Signed URLs for private buckets
- Frontend upload/download:
  - Use Supabase Storage API; handle progress, errors, and permissions

---

## 7. Notifications & Cronjobs

- Notifications:
  - Email via Resend (optional)
  - In-app toasts for user feedback
- Cronjobs/background:
  - Supabase Edge Functions + scheduled triggers (optional)
  - Or GitHub Actions/External scheduler

---

## 8. Styling & Theming

- TailwindCSS with `darkMode: 'class'`
- Global tokens:
  - `:root` sets light tokens; `.dark` sets dark variants
- shadcn/ui:
  - Use official primitives for consistent theming and accessibility
- Design tokens:
  - Extend `tailwind.config.ts` to map CSS variables to theme
- Conventions:
  - Use semantic classes (`bg-background`, `text-foreground`) instead of `bg-white`, `text-black`

---

## 9. Frontend + Backend Integration

- Data flow:
  - Supabase -> React Query hooks -> components
- Shared types:
  - `src/types` consumed by both fetching hooks and components
- Error/loading:
  - Standard skeleton/loader components; toast on errors
- Supabase client setup:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 10. Deployment

- Hosting:
  - Vercel (Next.js frontend)
  - Supabase (managed Postgres + auth + storage)
- CI/CD:
  - GitHub Actions: `.github/workflows/validate-and-test.yml`
  - Lint/Test on push and PR
- .env setup:
  - See `frontend/env.example` and root `.env.example` (to add if missing)
- Supabase deployment:
  - Apply migrations from `supabase/migrations`
- Build commands:
  - Frontend: `npm run build` (Next.js)
  - Backend: migrations via Supabase CLI

---

## 11. Testing

- Unit: Vitest
- E2E: Playwright
- Coverage: optional via Vitest config
- Running:
  - `npm run test`
  - `npm run test:e2e` (Playwright) — with local dev server

---

## 12. Code Quality & Tooling

- ESLint: linting rules
- Prettier: formatting
- Husky: pre-commit hooks (`.husky/pre-commit`)
- Commit conventions: Conventional Commits suggested

---

## 13. Monitoring & Logging

- Supabase Logs for backend
- (Optional) Sentry/LogSnag for frontend error tracking
- Logging:
  - Standard console logging in dev; structured logs in Edge Functions

---

## 14. External Integrations

- Examples:
  - Stripe for payments (optional)
  - UploadThing for file uploads (optional)
  - Resend for transactional emails
- Setup:
  - Environment variables and SDK initialization per provider docs

---

## 15. Local Development & Contributing

- Setup:
  ```bash
  git clone <repo-url>
  cd LEAVE-MANAGEMENT
  npm install
  cd frontend && npm install
  ```
- Run:
  ```bash
  npm run dev
  ```
- Local Supabase:
  - Install CLI (Windows via Scoop or installer)
  - `supabase start`
  - `supabase db migrate`
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional E2E creds: `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `E2E_HR_EMAIL`, `E2E_HR_PASSWORD`, `E2E_EMPLOYEE_EMAIL`, `E2E_EMPLOYEE_PASSWORD`
- Contribution guide:
  - Branch from `main`, PR with description, pass CI, add to `docs/AUDIT.md` if backend changes
- Codebase overview:
  - See `docs/backend-functions-and-policies.md` and `docs/frontend_README.md`

---

## 16. Performance Optimizations

- Lazy loading components and dynamic imports
- React Query cache tuning
- Bundle analysis via Next.js analyzer
- SSR/ISR as appropriate for dashboards and lists

---

## 17. SEO / Meta Tags

- Use Next.js metadata API
- Provide title, description, and OG tags per page
- Ensure auth pages are noindex

---

## 18. FAQ or Common Pitfalls

- Dark mode not applying globally:
  - Ensure `ThemeProvider` wraps app and Tailwind `darkMode: 'class'` is set
  - Replace `bg-white`/`text-black` with `bg-background`/`text-foreground`
- Supabase RLS recursion errors (42P17):
  - Use helper `get_current_user_department()` and mark STABLE
- E2E tests fail on protected routes:
  - Provide E2E_* env creds or use Playwright storageState login
- Documents export button not found:
  - Confirm UI label or implement Export feature; adjust test selectors

---

> Note: This README is a comprehensive guide and may include placeholders for details that vary per deployment. Keep `docs/AUDIT.md` up to date with backend changes and migration notes.