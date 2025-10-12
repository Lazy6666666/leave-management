# Prompt / PRD / Implementation Plan — Leave Management System (MVP)

This document is an authoritative prompt for an AI or engineering team to build a production-oriented Leave Management System from scratch (MVP) and roadmap to a robust product. It is written so that an automated agent or developer can follow it end-to-end and produce a working codebase.

Important global requirements and constraints
- Language: TypeScript (server + client). Use strict TypeScript settings. Never use the `any` type anywhere. Enforce via ESLint rule `@typescript-eslint/no-explicit-any: "error"` and TypeScript `noImplicitAny: true`.
- Framework: Next.js (latest stable recommended; repo uses Next 15.x — adapt to current stable), React 18+/19, Node.js 18+.
- Backend: Supabase (Postgres + Edge Functions) for rapid MVP. Alternatively a Node/Express or Fastify backend is acceptable with Postgres. The prompt and contracts assume Supabase services (Auth, DB, Storage, Edge Functions) where noted.
- Testing: Use Playwright for E2E and Playwright MCP features where available (playwright-mcp). Use Vitest for unit/integration tests. Use `@axe-core/playwright` for accessibility tests.
- Realtime: Supabase Realtime or WebSockets for live updates.
- Security: Row-Level Security (RLS) on Postgres tables. Never expose service-role keys in client builds. Keep secrets in deployment provider (Vercel/Netlify) or a secrets manager.
- Accessibility: Aim for WCAG 2.1 AA for public pages and dashboards.
- CI / CD: GitHub Actions or platform CI. Tests must run and pass before merge to main.
- Documentation: Keep design & PRD in repo as markdown. Use doc comments in code and `README.md` with run instructions.

NOTE: Use the Model Context Protocol / REF MCP to consult the latest authoritative docs (for packages/features and Playwright MCP). When writing or generating code, include references to MCP usage and test harness integration.

## Best Practices Documentation

The project includes comprehensive best practices documentation covering all major domains:

- **[📚 `docs/best-practices/supabase-backend.md`](./best-practices/supabase-backend.md)** - Row-Level Security (RLS) policies, Edge Functions, authentication patterns, storage security, realtime authorization, database migrations, and query optimization
- **[📚 `docs/best-practices/nextjs-vercel.md`](./best-practices/nextjs-vercel.md)** - Next.js 15 App Router architecture, server components, API routes, server actions, caching strategies, edge middleware, and deployment patterns
- **[📚 `docs/best-practices/security.md`](./best-practices/security.md)** - OWASP compliance, file upload security, security headers, authentication middleware, rate limiting, and vulnerability management
- **[📚 `docs/best-practices/testing.md`](./best-practices/testing.md)** - Playwright E2E testing, Vitest unit tests, accessibility testing, performance testing, and testing best practices
- **[📚 `docs/best-practices/design-system.md`](./best-practices/design-system.md)** - shadcn/ui components, Tailwind CSS tokens, responsive design, accessibility compliance, and component architecture
- **[📚 `docs/best-practices/performance.md`](./best-practices/performance.md)** - Core Web Vitals optimization, bundle optimization, database performance, caching strategies, image optimization, and monitoring
- **[📚 `docs/best-practices/deployment-operations.md`](./best-practices/deployment-operations.md)** - CI/CD pipelines, deployment strategies, monitoring, incident response, infrastructure as code, and operational procedures
- **[📚 `docs/best-practices/data-management.md`](./best-practices/data-management.md)** - Database migrations, GDPR compliance, audit trails, data retention, data quality validation, and data security

All code generation and implementation must comply with these best practices documents. Each domain provides practical code examples, configuration templates, and implementation guidelines.

---

Table of contents
1. Executive summary (MVP)
2. PRD: users, goals, features, acceptance criteria
3. System architecture
4. Data model (Postgres schema, migrations, RPCs)
5. API contract (endpoints, payloads, types)
6. Frontend structure, pages, components, imports list (per-file import examples)
7. Backend structure, edge functions, imports list
8. Security & RLS policies
9. Testing plan (unit, integration, Playwright MCP e2e + accessibility)
10. Tooling, linting, TypeScript config (no any), developer scripts
11. CI/CD and deployment
12. Step-by-step build checklist and timeline
13. Enhancement roadmap
14. Appendices: env vars, commands, sample commit messages

---

Root folder layout (mandatory)

The repository MUST use this top-level folder layout. CI and repo validation scripts will enforce it.

- `docs/` — all Markdown documentation, design docs, PRDs, and user-facing guides (no `.md` files allowed outside this folder)
- `scripts/` — all automation scripts, validation scripts, seeders, and developer helpers
- `frontend/` — frontend application source files (Next.js app)
- `backend/` — backend code, Supabase migrations, and Edge Functions

Additional top-level folders (optional) must be approved via the exceptions process in `docs/design-decisions.md`.


## 1) Executive summary (MVP)
Build a secure, maintainable Leave Management System supporting: user authentication, role-based access, leave request create/edit/delete, approval workflow, leave balances, admin UI for user and leave-type management, document uploads, notifications (email), and basic org reporting. The MVP must be fully typed (no `any`), well-tested (unit + e2e), and deployable to Vercel with Supabase for backend services.

Success criteria (MVP):
- Users can sign up / login.
- Users can create leave requests that validate business days and available balance.
 - Users can create leave requests that validate business days and available balance.
 - Managers can view team calendars and pending requests for their team but cannot approve or reject them.
 - Only Admins and HR can approve or reject leave requests; Admins can manage users and leave types.
- Document upload with expiry notifications configured.
- Basic admin dashboard with counts and leave stats.
- Playwright MCP tests for critical flows (signup, request creation, approval) pass in CI.

---

## 2) PRD (Users, Goals, Features, Acceptance)

Users & Roles
- All Users (Employee, Manager, HR, Admin): Can submit leave requests, view their own balances, and upload documents for their requests.
- Manager: View team calendar and pending requests for their team; may comment on requests but cannot approve/reject; can generate reports.
- HR/Admin: Manage users, leave types, view org reports, run exports, and approve/reject leave requests.

User stories (MVP)
- As an employee I want to create an account and register in the system so that I can access leave management features.
- As a user I want to securely login to the system so that I can access my leave management dashboard.
- As an employee I want to update my profile information so that my personal details are current.
- As an employee I want to submit a leave request so that my absence can be approved and planned for.
- As an employee I want to view my past and current leave requests so that I can track my leave usage and status.
- As an employee I want to view my available leave balances so that I can plan my time off effectively.
- As a manager I want to view my team's leave calendar so that I can coordinate team schedules and coverage.
- As a manager I want to review and act on team leave requests so that I can manage team availability efficiently.
- As an admin I want to manage system users so that I can maintain accurate employee records.
- As an admin I want to configure leave types and policies so that the system aligns with company requirements.
- As an admin I want to generate leave reports and analytics so that I can make data-driven decisions.
- As a user (Employee, Manager, HR, Admin), I want to upload and manage supporting documents for my leave requests, so that I can provide the necessary documentation.
- As an HR/Admin, I want to upload and manage company and employee documents, so that I can track expiration dates and ensure compliance.

Acceptance criteria (examples)
- User can register with email and password
- Email validation is performed during registration
- Password strength requirements are enforced (minimum 8 characters, mixed case, numbers)
- User receives confirmation email
- Profile setup wizard guides new users through initial configuration
- Social login integration (Google, Microsoft) is available
- Login form with email and password fields
- "Remember me" functionality
- Password reset flow via email
- Session management with automatic refresh
- Multi-factor authentication option
- Secure password storage using bcrypt
- Edit personal information (name, contact details)
- Upload and manage profile photo
- Update emergency contact information
- View and edit notification preferences
- Profile validation ensures data completeness
- Calendar interface for selecting leave dates
- Leave type selection (annual, sick, personal, etc.)
- Business day calculation excludes weekends and holidays
- Real-time balance validation before submission
- Reason text area with character limit
- Document upload capability for supporting documents
- Request submission confirmation with ticket number
- Email notification to manager and HR
- Chronological list of all leave requests
- Status indicators (pending, approved, rejected, cancelled)
- Filter by status and date range
- Detailed view of each request with approval comments
- Balance summary showing used vs. remaining leave
- Export functionality for personal records
- Dashboard widget showing current balances by leave type
- Visual representation of used vs. available leave
- Historical balance tracking
- Automatic accrual calculations based on company policy
- Carry-over policy implementation
- Balance alerts when approaching limits
- Monthly/weekly calendar view with team members' leave
- Color-coded by leave type and status
- Clickable days showing detailed leave information
- Filter by team member and leave type
- Export calendar to external applications
- Overlap detection for team coverage planning
- Dashboard showing pending requests with priority indicators
- Detailed request view with employee information
- Business impact assessment tools
- Approval/rejection workflow with comments
- Bulk approval capabilities for multiple requests
- Notification system for urgent requests
- Approval history tracking
- User directory with search and filter capabilities
- Add/edit/delete user accounts
- Role assignment (employee, manager, HR, admin)
- Department and team management
- User import/export functionality
- Account activation/deactivation
- Audit trail for user management actions
- Create custom leave types with descriptions
- Set allocation rules (annual, accrual-based, etc.)
- Define carry-over policies and limits
- Configure documentation requirements
- Set approval workflows by leave type
- Enable/disable leave types
- Policy versioning and change tracking
- Pre-built report templates (monthly summaries, department usage)
- Custom report builder with filters and metrics
- Data export to CSV, Excel, and PDF formats
- Dashboard with key performance indicators
- Trend analysis and forecasting
- Compliance reporting for regulatory requirements
- Automated report scheduling and distribution
- Drag-and-drop file upload interface
- File type validation (PDF, JPG, PNG)
- File size limits and compression
- Document categorization and tagging
- Expiration date tracking and notifications
- Secure document storage with access controls
- Document versioning and history
- Automated expiry notifications before deadlines
- Bulk document renewal capabilities
- Expiry dashboard with filtering and sorting
- Document archive and retention policies
- Audit trail for document lifecycle
- Integration with external document management systems

---

## 3) System architecture (recommended)

- Frontend: Next.js + TypeScript + React + React Query + Tailwind + shadcn components.
- Backend: Supabase (Postgres), Edge Functions for business logic that needs server privileges or async tasks (notifications).
- Auth: Supabase Auth (JWT). Frontend uses `@supabase/auth-helpers-nextjs` or `@supabase/ssr` for server/client usage.
- Realtime: Supabase Realtime channels for live updates.
- Storage: Supabase Storage for documents.
- CI/CD: GitHub Actions for tests and pre-deploy checks; Vercel for frontend deployment; Supabase CLI for migrations and edge function deploys.

Design system and UI library
- Use `shadcn/ui` as the primary component library. Build all app UI with shadcn primitives + Tailwind tokens. Do not introduce competing UI libraries for core components.
- Visual style: tri-color, clean, professional, modern, and sleek. Define a strict palette with Tailwind variables:
  - Primary: --color-primary (used for primary actions, links, brand)
  - Accent: --color-accent (used for highlights, badges)
  - Neutral: --color-neutral (backgrounds, borders, muted text)
- Provide accessibility variants (focus, hover, active) and high-contrast modes. Document the tokens in `docs/design-system.md` and implement tokens in `tailwind.config.js` under `theme.extend.colors`.
-
Light / Dark mode (theming)

The application must support both Light Mode and Dark Mode. Implement theming using Tailwind CSS tokens and CSS custom properties so styles can switch dynamically at runtime. Requirements:

- Provide a `data-theme` attribute on the `html` or `body` element with values `light` or `dark`.
- Define CSS variables for all semantic tokens (colors, surface, border, text, muted, etc.) and map them in `tailwind.config.js` using `theme.extend.colors` so Tailwind utilities consume them.
- Offer a user-preference mechanism that respects OS-level preference via `prefers-color-scheme` and provides an in-app toggle (persist preference in `localStorage` and sync to server user profile when authenticated).
- Ensure shadcn wrapper components in `src/components/ui/*` read tokens from CSS variables (not inline styles) and accept `data-mcp`/`data-test` attributes.
- Accessibility: verify color contrast in both themes using automated accessibility checks (e.g., `@axe-core/playwright`). Include theme-switching checks in Playwright tests.

Example CSS token names (suggested):

- --color-bg
- --color-surface
- --color-primary
- --color-accent
- --color-neutral
- --color-text
- --color-muted
- --color-border

Switching themes should not require a full page reload. Persist theme preference server-side (optional) on user profile so users see their chosen theme across devices.


Strict implementation rules (NO BYPASSES)

Clarification: the strict rules below apply only to the specific areas and behaviors explicitly mandated in this `PROMPT.md` (for example: the design system tokens, use of `shadcn/ui` for core UI primitives, folder/file layout rules, RLS enforcement, API contracts, testing harness and MCP conventions). For parts of the project not explicitly constrained by this prompt, teams may choose appropriate alternatives — but any deviation that affects a mandated area requires the exceptions process (see #6).

The following rules are mandatory for the named areas. They must be followed exactly. CI will enforce these rules and any PRs that attempt to bypass them will be rejected until fixed.

1) shadcn/ui is mandatory for core UI components (where specified)
- For the core UI primitives and shared design-system components listed in this prompt (buttons, inputs, modals, tables, badges, forms, calendar tiles, export UI), you must use `shadcn/ui` primitives or a thin wrapper around them in `src/components/ui/*`.
- This requirement does not prevent using other libraries for isolated, non-core functionality (examples: an embedded data-visualization widget that is not part of the shared UI) — but such choices must not replace or undermine the mandated design system and must be documented.

2) No bypasses or shadow imports
- Do not copy/paste component implementations from external libraries into the codebase to replace mandated shadcn wrappers. Do not vendor UI libraries directly for the mandated areas. All UI composition for the specified areas must be done via shadcn primitives, project wrappers, or small custom components that extend the wrappers.

3) File & folder rules (strict)
- All Markdown documentation for the project must live under `docs/`. No `.md` files are allowed outside `docs/` unless explicitly approved.
- All automation and developer scripts must live under `scripts/`. No `.js`/`.ts` scripts for devops, migrations, seeding, or tooling are allowed outside `scripts/` or `supabase/migrations` (for SQL migrations).
- All front-end UI primitives and wrappers that implement the mandated design system must live under `src/components/ui/`.

4) CI & pre-commit enforcement
- Add `npm run validate-structure` to CI and Husky pre-commit so PRs fail if files are placed outside their designated folders.
- Add a lint rule or CI job that scans imports for banned patterns that would bypass mandated libraries for the specified areas (for example, importing `@mui/*` for a file under `src/components/ui/` should fail). This can be an ESLint custom rule or a Node script run in CI.

5) shadcn usage conventions
- All shadcn wrapper components must accept and pass through a `data-mcp` or `data-test` attribute to their underlying DOM elements. This enables stable MCP and Playwright selectors.
- Avoid inline styles that bypass Tailwind tokens for colors, spacing, and typography in the mandated design-system areas. Use design-system tokens defined in `docs/design-system.md`.

6) Exceptions process
- If a developer believes a new library or deviation is necessary (for the mandated areas), open a design-decisions document in `docs/design-decisions.md` explaining the reasons, alternatives evaluated, risk assessment, and migration plan. Obtain explicit written approval from project owners before merging.

7) PROMPT.md is authoritative
- `PROMPT.md` is the single authoritative instruction for how the project must be implemented for the areas it mandates. Follow it strictly. If a section of the code or a PR conflicts with `PROMPT.md`, the PR should be paused until the conflict is resolved and the `PROMPT.md` updated if necessary.

Tools & MCP
- Prefer `shadcn-mcp` patterns where Playwright MCP or other model-driven UI tests are referenced; ensure component stories or test harnesses are compatible with MCP workflows.

High-level flow: Frontend -> Next API routes (server-side) -> Supabase Client (server) -> Postgres / Edge functions -> Realtime updates via Supabase.

---

## 4) Data Model (Postgres) — core tables and RPCs

Tables (MVP):
- employees (id uuid primary key, supabase_id uuid references auth.users.id, email, name, first_name, last_name, role enum(user_role), department, photo_url, is_active boolean, created_at, updated_at)
- leave_types (id uuid, name, description, default_allocation_days int, is_active boolean)
- leave_balances (id uuid, employee_id uuid references employees(id), leave_type_id uuid, total_days int, used_days int, year int)
- leaves (id uuid, requester_id uuid references employees(id), leave_type_id uuid, start_date date, end_date date, days_count int, status enum('pending','approved','rejected','cancelled'), reason text, approver_id uuid, approved_at timestamptz, created_at, updated_at)
- company_documents (id uuid, uploaded_by uuid references employees(id), name text, storage_path text, expiry_date date, metadata jsonb, created_at)
- audit_logs (id uuid, user_id uuid, action text, table_name text, record_id uuid, old jsonb, new jsonb, created_at)

Additional tables & views for admin features and calendar:
- leave_events_view (view): exposes one row per calendar date a leave covers with columns: date, leave_id, requester_id, requester_name, leave_type, status, approver_id, document_count, notes. This view is the canonical source for calendar UI and per-date details.
- leave_aggregates_view (view): per-user aggregated records (year, month, total_requested, total_approved, total_rejected, total_cancelled, total_days) used for admin search and export.

Enums:
- user_role = ('employee', 'manager', 'admin', 'hr')
- leave_status = ('pending','approved','rejected','cancelled')

RPCs and helper functions required (SQL/procedural functions):
- get_user_role() RETURNS user_role - returns current user role using auth.uid() mapping.
- get_available_leave_days(p_employee_id uuid, p_leave_type_id uuid, p_year int) RETURNS int - calculates remaining days.
- initialize_leave_balances(p_employee_id uuid) - insert default leave_balances.
- can_edit_leave_request(p_leave_id uuid, p_user_id uuid) RETURNS boolean.

Additional RPCs for admin operations:
- admin_search_leave_records(p_user_id uuid DEFAULT NULL, p_month int DEFAULT NULL, p_year int DEFAULT NULL, p_limit int DEFAULT 100, p_offset int DEFAULT 0) RETURNS SETOF leave_aggregates_view
- get_calendar_events(p_start_date date, p_end_date date) RETURNS SETOF leave_events_view

Indexes
- Index on leaves(requester_id), leaves(status), leave_balances(employee_id, leave_type_id), employees(supabase_id).

Row-Level Security (RLS)
- Enable RLS on all tables and implement policies:
  - employees: allow users to select their own profile; allow admin/hr select all; allow manager to select employees in their department.
  - leaves: allow requester to insert/select their leaves; allow approver/manager to select/approve when they are assigned or in same department; allow admin/hr full access.

Migrations
- Maintain ordered SQL migrations in `supabase/migrations/` and commit them.

---

## 5) API contract (server / Next API routes or Edge functions)

Principles: All responses should follow typed shapes. Provide strict types in `src/lib/api/types.ts`. Use consistent error envelope: { error: { code: string, message: string, details?: any } } but do not use `any` — use `unknown`/structured types.

Common status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal.

Key endpoints (examples with types):

- POST /api/auth/signup
  - Payload: { email: string, password: string, firstName?: string, lastName?: string }
  - Response: 201 { userId: string }

- POST /api/auth/login
  - Payload: { email: string, password: string }
  - Response: 200 { accessToken: string, refreshToken: string, user: UserPublic }

- GET /api/leaves?status=&limit=&offset=
  - Response: 200 { data: LeaveWithRelations[], total: number }
  - Type LeaveWithRelations: typed object (see types section)

- POST /api/leaves
  - Payload: { start_date: string (ISO), end_date: string, leave_type_id: string, reason?: string }
  - Response: 201 { data: LeaveWithRelations }

- PATCH /api/leaves/:id/approve
- PATCH /api/leaves/:id/approve
  - Requires Admin/HR role. Payload: { comment?: string }
  - Response: 200 { data: LeaveWithRelations }

- PATCH /api/leaves/:id/reject
  - Requires manager. Payload: { reason: string }

- GET /api/admin/users
  - Requires admin/hr. Returns paginated list of users.

New admin endpoints (detailed):
- GET /api/admin/leave-records?user_id=&month=&year=&limit=&offset=
  - Roles: admin/hr only
  - Query params: user_id (optional), month (1-12 optional), year (YYYY optional), export (csv|json optional)
  - Response (json): { total: number, data: LeaveAggregate[] }
  - If export=csv, return Content-Type: text/csv and CSV body with headers (user_id, user_name, month, year, total_requested, total_approved, total_rejected, total_days, details_link)

- POST /api/admin/leave-records/export
  - Roles: admin/hr only
  - Payload: { user_id?: string, month?: number, year?: number, format: 'csv'|'json' }
  - Response: 200 with file download or a storage link for large exports

- GET /api/calendar?start=&end=
  - Roles: admin/hr/manager (and regular user only for their own calendar when authorized)
  - Response: { events: LeaveEvent[] } where LeaveEvent maps to `leave_events_view` rows

- GET /api/calendar/:date
  - Returns detailed popup data for that date: list of leave entries with requester, leave type, status, approver, documents (urls + metadata), notes

- POST /api/documents (multipart/form-data)
  - Upload file to Supabase Storage and create company_documents row.

- POST /api/admin/reports
  - Generate CSV or JSON reports.

Type definitions (suggested files):
- `frontend/types/index.ts` or `src/types/`:
  - export type User = { id: string; email: string; first_name?: string; last_name?: string; role: 'employee'|'manager'|'admin'|'hr' }
  - export type Leave = { id: string; requester_id: string; leave_type_id: string; start_date: string; end_date: string; days_count: number; status: 'pending'|'approved'|'rejected'|'cancelled'; reason?: string; approver_id?: string }
  - export type LeaveWithRelations = Leave & { requester?: User; leave_type?: { id: string, name: string } }

  Additional types for admin endpoints:
  - export type LeaveEvent = { date: string; leave_id: string; requester_id: string; requester_name: string; leave_type: string; status: string; approver_id?: string; document_count: number; notes?: string }
  - export type LeaveAggregate = { user_id: string; user_name: string; month: number; year: number; total_requested: number; total_approved: number; total_rejected: number; total_cancelled: number; total_days: number }

All server routes should validate payloads with Zod schemas and parse to typed objects.

---

## 6) Frontend structure & recommended files with import lists

Project root (frontend):
```
frontend/
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ src/
│  ├─ app/ (if using app router) or pages/ (pages router)
│  ├─ components/
│  │   ├─ layout/DashboardLayout.tsx
│  │   ├─ ui/* (cards, table, modal)
│  ├─ hooks/
│  │   ├─ useRealtimeProfile.ts
│  │   ├─ useAuth.ts
│  ├─ lib/
│  │   ├─ supabase-client.ts
│  │   ├─ supabase-server.ts
│  │   ├─ api-client.ts (wrapper for fetch to server APIs)
│  ├─ pages/
│  │   ├─ index.tsx
│  │   ├─ login/index.tsx
│  │   ├─ register/index.tsx
│  │   ├─ dashboard/leaves/index.tsx
│  │   ├─ dashboard/leaves/new.tsx
│  │   ├─ dashboard/admin/users/index.tsx
│  ├─ types/
│  │   ├─ database.types.ts (generated from Supabase schema)
│  └─ styles/
```

Key frontend files and import examples

- `src/lib/supabase-client.ts` (browser client)
  - Imports:
    - import { createBrowserClient } from '@supabase/ssr'
  - Purpose: create a single browser client, reads NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.

- `src/lib/supabase-server.ts` (server-side Next API helper)
  - Imports:
    - import { createServerClient } from '@supabase/ssr'
    - import type { NextApiRequest, NextApiResponse } from 'next'
  - Purpose: create Supabase client that reads cookies from req/res for server-side auth.

- `src/hooks/useRealtimeProfile.ts`
  - Imports:
    - import { useEffect } from 'react'
    - import { useQueryClient } from '@tanstack/react-query'
    - import { getBrowserClient } from '@/lib/supabase-client'
  - Purpose: Subscribes to Realtime profile changes and invalidates queries.

- `src/pages/dashboard/leaves/index.tsx`
  - Imports:
    - import React from 'react'
    - import { useQuery, useMutation } from '@tanstack/react-query'
    - import { fetchLeaves } from '@/lib/api-client'
    - import { Table, Badge, Button } from '@/components/ui'
  - Purpose: show list of leaves, create / delete actions.

- `src/pages/api/leaves/index.ts` (server API)
  - Imports:
    - import type { NextApiRequest, NextApiResponse } from 'next'
    - import { createClient } from '@/lib/supabase-server'
    - import { getUserProfile } from '@/lib/permissions'
    - import { z } from 'zod'
  - Purpose: implement GET and POST handlers with validation and typed responses.

Important: For every file include the import lines exactly at top. When generating code, include full import statements in the templates. Use absolute aliases (tsconfig `paths`) or relative imports consistently.

Admin UI specifics (frontend pages & components):
- `src/pages/dashboard/admin/reports/index.tsx` — Admin reports page with search controls (user lookup, month/year selectors), results table, pagination, export CSV button. Uses `/api/admin/leave-records`.
- `src/pages/dashboard/admin/calendar.tsx` — Team calendar view. Uses `/api/calendar` for events and `/api/calendar/:date` for modal details.
- `src/components/calendar/TeamCalendar.tsx` — Calendar component (react-day-picker or FullCalendar) with clickable days that open `src/components/calendar/DateDetailsModal.tsx`.
- `src/components/admin/LeaveExportButton.tsx` — wired to call export endpoint and handle download.

Design system files (frontend):
- `src/styles/design-system.css` — central Tailwind imports and CSS variables for the tri-color palette.
- `docs/design-system.md` — design tokens, color usage matrix, spacing scale, typography, and component guidelines for shadcn.
- `src/components/ui/*` — shadcn wrapper components and design-system-aware primitives (Button, Input, Modal, Badge) that read the token variables.

---

## 7) Backend structure (Supabase migrations + Edge Functions) and imports

Backend layout suggestion:
```
backend/
├─ package.json
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  │   ├─ create-leave-request/index.ts
│  │   ├─ approve-leave/index.ts
│  │   ├─ get-org-stats/index.ts
│  │   ├─ check-document-expiry/index.ts
│  │   ├─ _shared/rate-limiter.ts
│  ├─ deno.json
```

Example imports for edge functions (Deno + supabase-js):
- import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
- import { createClient } from '@supabase/supabase-js'
- import { checkRateLimit, getRateLimitHeaders } from './_shared/rate-limiter.ts'

Edge function responsibilities
- create-leave-request: validate input, compute business-days, call RPC get_available_leave_days, insert `leaves` record, return created row, trigger notification.
- approve-leave: validate approver is manager/admin, update `leaves` status and call RPC update_leave_balance.
- check-document-expiry: scheduled function (cron) that queries `company_documents` and `leave_documents` for items nearing expiry and sends notifications via email (SendGrid) and internal notification logs. Details below under "Document expiry notifications".
  
Document expiry notifications (cron + admin-only manual trigger)

- Purpose: ensure company and leave-related documents with an `expiry_date` generate timely alerts so admins and document owners can take action (renew, archive, or notify stakeholders).

- Scheduled job:
  - Implement as a Supabase Edge Function (or server-side job) invoked on a cron schedule (recommended daily at 02:00 UTC). Use the deployment provider's scheduler or GitHub Actions schedule to call the Edge Function endpoint.
  - The function must run with the service role key (server-side only) and must never be callable from browser clients.

- Behavior:
  - Query `company_documents` and `leave_documents` for records where `expiry_date` is within configurable thresholds (e.g., 30 days, 14 days, 7 days, 1 day).
  - For each match, build a notification payload including document id, name, uploader (`uploaded_by` / owner), expiry_date, storage link (signed URL when appropriate), and suggested action.
  - Write a notification entry to `notification_logs` and/or `document_notifiers` with the timestamp and status. This provides an audit trail.
  - Send emails using SendGrid (or configured mail provider). Email targets:
    - Primary: configured admin recipients (ADMIN_NOTIFICATION_EMAILS env var) — Admin/HR receives consolidated notifications.
    - Secondary: document owner (`uploaded_by`) if `notify_owner` is enabled.
  - For large batches, the function should either stream notifications or enqueue follow-up jobs to avoid long-running timeouts.

- Manual/admin trigger:
  - Provide a protected admin-only API route (e.g., `POST /api/admin/documents/notify-expiry`) that triggers the same function on demand. This route must require Admin or HR role and validate caller via server-side Supabase admin client.
  - Use this manual trigger for ad-hoc runs and testing; still require service-role execution privileges server-side.

- Configuration & env vars:
  - `SENDGRID_API_KEY` (or MAIL_PROVIDER_API_KEY)
  - `ADMIN_NOTIFICATION_EMAILS` (comma-separated list of admin/HR recipients)
  - `EXPIRY_NOTIFICATION_THRESHOLDS` (e.g., "30,14,7,1")
  - `NOTIFICATION_BATCH_SIZE` (for large exports)
  - `SUPABASE_SERVICE_ROLE_KEY` (required to create signed URLs and run admin queries)

- Security & RBAC:
  - The scheduled job runs entirely server-side with the service role key. It must not be exposed to the browser or callable by non-privileged users.
  - The manual/admin trigger route must validate Admin/HR role via helper `is_admin_or_hr()` (or `get_user_role()`) and return 403 for others.

- Observability & retries:
  - Log all sent notifications to `notification_logs` with status, message-id (email provider id), and error details on failure.
  - Implement exponential backoff and retry for transient email failures and record final status.

Extended requirements: admin control, custom thresholds, employee documents, and stop-notify

- Document types covered:
  - `company_documents` (company-level documents: trade licenses, insurances, contracts)
  - `leave_documents` / `employee_documents` (employee-level documents: passports, visas, certifications). The system must support both types and allow different notification recipients (admins and/or document owners).

- Admin controls when uploading/creating documents:
  - Admins can upload documents and set an `expiry_date`.
  - Admins can configure notification behavior per-document:
    - `notify_thresholds`: e.g., "3 months" (90 days) from expiry to start reminders, or explicit custom dates (start reminders on a specific date).
    - `notify_frequency`: daily reminders (default) or custom frequency.
    - `notify_owner`: boolean to also email the document owner (employee) when applicable.
    - `stop_notifications`: flag to manually stop reminders for a document (admin can toggle this). Once set, reminders cease until re-enabled.
  - Admins may set reminders to continue every day until the document is renewed (expiry cleared or replaced) or until `stop_notifications` is toggled.

- UI & API expectations for document management:
  - Admin UI: `Admin -> Documents` page with list, filters (type, department, expiry range), per-item actions (Edit, Stop Notifications, Renew, Delete), and bulk actions (Send Reminder Now, Export list).
  - API endpoints (admin-only):
    - POST `/api/admin/documents` — upload/create document (multipart/form-data). Payload includes `expiry_date`, `notify_thresholds` (array), `notify_frequency`, `notify_owner`, `stop_notifications`.
    - PATCH `/api/admin/documents/:id` — edit metadata, toggle `stop_notifications`, update `expiry_date` (renewal action clears notification state as appropriate).
    - GET `/api/admin/documents?type=&expiry_before=&expiry_after=&owner_id=&limit=&offset=` — paginated admin listing with filters.
    - POST `/api/admin/documents/:id/notify-now` — admin-triggered immediate reminder for a specific document.

- Daily reminder behavior:
  - For each document whose `expiry_date` minus the nearest `notify_threshold` is <= today and `stop_notifications` is false, send an email reminder once per `notify_frequency` (default daily) until:
    - The document is renewed/expiry removed/updated to future date beyond the threshold, or
    - `stop_notifications` is toggled true by an admin, or
    - a maximum notification window is reached (configurable, e.g., 365 days) to avoid indefinite emails for forgotten entries.

- Employee documents (passports/visas):
  - Support linking documents to employee records (`employee_id`) and optionally set `notify_owner=true` so the employee receives reminders as well as admins.
  - When sending to employees, respect privacy: emails should not expose unnecessary metadata; include only required info and a secure signed URL if the document is private.

- Admin user management (CRUD):
  - Admins must be able to create, edit, and delete users via an Admin UI and API:
    - POST `/api/admin/users` — create user (email, name, role, department, initial password or invite flow).
    - PATCH `/api/admin/users/:id` — update user details and role.
    - DELETE `/api/admin/users/:id` — deactivate or delete user (prefer soft-delete: set `is_active=false`).
    - GET `/api/admin/users?role=&department=&search=&limit=&offset=` — list users with filters.
  - Ensure all user management operations are logged to `audit_logs` with before/after snapshots and admin user id.

- Safe backend update practice: check Supabase project tables before modifying schema
  - Before applying migrations or updates to the backend, the deployment process and any Edge Functions MUST first introspect the target Supabase database schema to discover existing tables and columns. This prevents creating conflicting or duplicate tables (or orphaned data) and avoids applying migrations that reference non-existent columns.
  - Recommended workflow:
    1. Connect to the target Supabase project using an admin service client.
    2. Query `information_schema.tables` and `information_schema.columns` to list existing tables and columns.
    3. Compare intended migration changes against the live schema; if mismatches are detected (missing columns/tables or naming differences like `department` vs `department_id`), abort and surface a clear error with remediation steps.
    4. Generate idempotent migrations using `IF NOT EXISTS` or `DROP IF EXISTS` patterns where safe, and prefer additive migrations when possible.
  - Log any schema-check findings to CI output and to `audit_logs` when running production migrations.



New functions related to admin features:
- admin_search_leave_records: Edge Function that runs `admin_search_leave_records` RPC with service role key and streams CSV results for large datasets.
- calendar_events: Edge Function that returns `leave_events_view` rows for a date range (supports `include_documents=true`) and is cacheable for performance.

Server admin helper (used by Next API routes):
- `lib/server/supabase-admin.ts`
  - Imports:
    - import { createClient } from '@supabase/supabase-js'
  - Purpose: create an admin client using `SUPABASE_SERVICE_ROLE_KEY`.

---

## 8) Security & RLS policies (detail)

- Use Postgres RLS for data protection. Example policy patterns:

1) employees table
```sql
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_self" ON public.employees
  FOR SELECT USING (supabase_id = auth.uid());
CREATE POLICY "employees_admin" ON public.employees
  FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 WHERE auth.uid() IS NOT NULL AND auth.role() = 'admin')) -- pseudo code; implement via function
```

2) leaves table
```sql
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaves_requester_self" ON public.leaves
  FOR SELECT USING (requester_id = get_employee_id_by_supabase_uid(auth.uid()));
CREATE POLICY "leaves_manager" ON public.leaves
  FOR SELECT USING (EXISTS (SELECT 1 FROM employees m WHERE m.email = auth.role() AND m.department = (SELECT department FROM employees WHERE id = requester_id) AND m.role = 'manager'));

Role-specific policies and enforcement:
- Approval policy: Only allow updates that change `status` to 'approved' or 'rejected' if the `auth.uid()` belongs to an employee with role IN ('admin','hr'). Enforce using a SQL function `is_admin_or_hr(auth.uid())` in a `FOR UPDATE` policy.
- Calendar policy: `leave_events_view` should be exposed through a RPC `get_calendar_events` that filters sensitive fields based on caller role; non-admins should not receive `notes` or private metadata unless authorized.
```

- Keep `SUPABASE_SERVICE_ROLE_KEY` secure; only server-side code or admin clients should use it.

---

## 9) Testing plan (Playwright MCP + Vitest + accessibility)

Testing strategy
- Unit tests (Vitest) for utility logic (date calculations, leave-day calculations, RPC wrappers).
- Integration tests (Vitest) for Next API routes with mocked Supabase or local Supabase instance.
- E2E tests (Playwright) for user flows. Integrate Playwright MCP to run tests with models or structured prompts if applicable.
- Accessibility: run @axe-core/playwright on critical pages.

Playwright MCP integration notes (how to set up):
- Install Playwright and Playwright MCP package per REF MCP docs.
- Use Playwright test runner with `playwright.config.ts` configured for MCP features.
- Critical E2E scenarios to cover with Playwright MCP:
  - Signup/login -> create leave request -> manager receives pending -> manager approves -> employee sees approved status.
  - Upload document -> verify storage and notification scheduled.
  - Admin: create user -> assign role -> verify RLS prevents normal user from seeing admin data.

  Additional E2E scenarios (Admin & Calendar):
  - Admin export flow: Admin searches for a user by name/id, filters by month and year, clicks Export CSV, downloads file and verifies CSV headers and aggregated totals.
  - Calendar popup: Manager or Admin opens team calendar, clicks a date with multiple leaves, verifies modal shows all leave entries for that date including document links, leave types, and approver names.
  - Role enforcement: Manager attempts to approve a leave via UI/API and receives 403; Admin approves successfully and the UI updates in real-time.

  Visual regression and component tests
  - Add visual regression checks for key components using Playwright snapshots and incorporate a small set of component stories or fixtures that MCP can reference. Verify that color tokens and button styles match the design-system spec.

Example Playwright test file imports
- import { test, expect } from '@playwright/test'
- import { MCP } from 'playwright-mcp' // if using MCP integration; consult REF MCP

Accessibility test (example)
- import { injectAxe, checkA11y } from '@axe-core/playwright'

CI step: run `npm run test:unit` then `npm run test:e2e --project=chromium` and a11y checks.

---

## 10) Tooling, linting, TypeScript config (no `any` allowed)

tsconfig.json important flags
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

ESLint config highlights
- Use `eslint` + `@typescript-eslint` + `eslint-config-next`.
- Enforce `@typescript-eslint/no-explicit-any: 'error'`.
- Enforce `@typescript-eslint/explicit-function-return-type` for public functions (optional strictness).

Prettier + husky
- Pre-commit format & lint via husky + lint-staged.

Scripts (package.json)
- "dev": "next dev"
- "build": "next build"
- "start": "next start"
- "test": "vitest"
- "test:e2e": "playwright test"
- "lint": "next lint"
- "type-check": "tsc --noEmit"

Repository structure policy and enforcement:
- All Markdown documentation must live in a top-level `docs/` folder. The codebase must not contain `.md` files outside `docs/`.
- All executable scripts or developer scripts must live in a top-level `scripts/` folder. No script files should be added elsewhere.
- A validation script `scripts/validate-repo-structure.ts` (or `.js`) should be created and included in `package.json` as `npm run validate-structure` and run by CI and as a pre-commit hook to enforce these rules.

Design & implementation notes
- All UI components must import shadcn variants from `src/components/ui/*`. Custom components are allowed only when they wrap or extend shadcn primitives.
- The `docs/design-system.md` file must be the single source of truth for theming, tokens, and usage examples. Designers and developers should update this file when adding or changing tokens.

---

## 11) CI / CD and deployment

GitHub Actions workflow (high-level):
- on: [push, pull_request]
- jobs:
  - build-and-test
    - runs-on: ubuntu-latest
    - steps:
      - checkout
      - setup-node (node 18)
      - npm ci
      - npm run lint
      - npm run type-check
      - npm run test (unit)
      - npm run test:e2e (Playwright)

Deployment
- Frontend: Vercel (recommended). Add env vars in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL, SUPABASE_SERVICE_ROLE_KEY (build secret), SENDGRID_API_KEY, SENTRY_DSN.
- Backend: use Supabase CLI to push migrations and deploy Edge Functions.

CI enforcement rules:
- The CI pipeline must run `npm run validate-structure` and fail if docs or script files are placed outside their respective folders.
- The CI must validate that migrations enabling RLS and creating policy functions exist. If these specific migration files are missing, CI should emit a warning step recommending adding them.

---

## 12) Step-by-step build checklist & timeline (suggested)

Phase 0: Project setup (1 day)
- Create monorepo with workspaces `frontend` and `backend`.
- Add tsconfig, ESLint, Prettier, Husky, and initial package.json scripts.
- Setup Supabase project and add basic tables: employees, leave_types, leaves.

Phase 1: Auth + Profiles (1-2 days)
- Implement signup/login pages and Next API wrapper to authenticate.
- Create employee profile creation flow via signup trigger or server route.

Phase 2: Leave requests (2-3 days)
- Implement create leave request form with validation (Zod) and business-day calculation util.
- Implement server route or edge function to validate balance and insert row.
- Add leave list page.

Phase 3: Approval flow (1-2 days)
- Implement manager dashboard and approve/reject endpoints.
- Ensure RLS enforces access.

Phase 4: Admin features & reports (2 days)
- User management CRUD and leave type management.
- Basic org dashboard using Recharts or similar.

Phase 4b: Admin reporting & calendar (2-3 days)
- Implement `leave_aggregates_view` and `leave_events_view` migrations.
- Implement Edge Functions / API routes for admin search/export and calendar endpoints.
- Build admin reports page with filters (user, month, year) and CSV export.
- Build calendar page with clickable dates and modal details.

Phase 5: Documents & notifications (2 days)
- Implement file upload to Supabase Storage and document expiry notifier edge function.

Phase 6: Testing & hardening (2-3 days)
- Add unit/integration tests.
- Add Playwright MCP e2e tests and accessibility checks.
- Setup CI/CD and run smoke deployments.

---

## 13) Enhancement roadmap (post-MVP)
- Calendar integration (Google Calendar sync)
- Vacation accrual rules per policy and calendar holidays integration
- Multi-department approver workflows
- Audit trail UI and export
- Slack/webhook notifications
- Role/permission admin UI with granular scopes

---

## 14) Appendices

### Environment variables (minimum)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL
- SENDGRID_API_KEY
- SENTRY_DSN (optional)
- NODE_ENV, PORT

### Repo folder rules (appendix)
- `docs/` — all `.md` files, design docs, PRDs, and user-facing guides
- `scripts/` — all automation scripts, validation scripts, seeders, and developer helpers
- `supabase/migrations/` — SQL migrations only
- `frontend/` & `backend/` — application source files only (no stray docs or scripts)

Add `package.json` scripts at the monorepo root:
```json
"scripts": {
  "validate-structure": "node ./scripts/validate-repo-structure.js",
  "type-check": "tsc --noEmit",
  "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
  "test": "vitest"
}
```

### Scripts & how to use them (developer guide)

We provide repository validation and helper scripts under the top-level `scripts/` folder. These are lightweight, cross-platform helpers used by CI and local development to enforce the repository rules described in this prompt (all `.md` files in `docs/`, scripts only under `scripts/` or `supabase/migrations`, and required top-level folders `docs`, `scripts`, `frontend`, `backend`).

Files added:
- `scripts/validate-repo-structure.ts` — TypeScript source that performs the validation. Use this during local development if you prefer to run TypeScript directly.
- `scripts/validate-repo-structure.js` — Node.js runnable script used by CI and the `npm run validate-structure` entry.
- `scripts/check-structure.ps1` — PowerShell helper for Windows environments that performs the same checks and returns canonical exit codes for CI/local shells.

Exit codes
- 0 — validation passed
- 2 — validation failed (script prints details to stderr)

Run locally (recommended)

PowerShell (Windows)
```powershell
# run the PowerShell helper
.\scripts\check-structure.ps1
```

Node (cross-platform)
```powershell
# using the packaged JS (recommended for CI)
node ./scripts/validate-repo-structure.js

# or via npm script defined at repository root
npm run validate-structure
```

TypeScript (developer; requires ts-node or compilation)
```powershell
# if you have ts-node installed globally or as a dev dependency
npx ts-node ./scripts/validate-repo-structure.ts
```

CI integration example (GitHub Actions)
```yaml
- name: Validate repo structure
  run: |
    npm ci
    npm run validate-structure
```

Husky / pre-commit
- We recommend wiring `npm run validate-structure` into a Husky pre-commit hook so commits are validated locally before pushing. Example `.husky/pre-commit` line:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npm run validate-structure || exit 1
```

Troubleshooting & notes
- If the script exits with code 2 it prints the offending paths. Fix the file locations (move `.md` files into `docs/`, move scripts into `scripts/` or `supabase/migrations/`, or add an exception via `docs/design-decisions.md`).
- The JS script (`validate-repo-structure.js`) is the canonical runtime used by CI to avoid needing a TypeScript runtime in the pipeline. The `.ts` source is kept for readability and local edits.
- The PowerShell script is intended for Windows developers who prefer native PowerShell tooling.

If you want I can also add a small GitHub Actions job stub and a Husky configuration file to this repo to wire these checks into CI and pre-commit hooks.

### Key commands (PowerShell compatible)
```powershell
# Install
npm install

# Start frontend dev
cd frontend
npm run dev

# Start backend dev (Supabase functions)
cd backend
npm run dev

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run type checks
npm run type-check

# Lint
npm run lint
```

### Sample import lists (package names to install)
- Next / React / ReactDOM: next, react, react-dom
- Supabase: @supabase/supabase-js, @supabase/auth-helpers-nextjs, @supabase/ssr
- Data-fetching: @tanstack/react-query
- Forms & validation: react-hook-form, zod, @hookform/resolvers
- UI: tailwindcss, shadcn components or Radix, lucide-react
- Charts: recharts
- Testing: vitest, @testing-library/react, playwright, @axe-core/playwright
- Types: typescript, @types/node, @types/react
- Linting: eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-config-next
- Dev utilities: tsx, prettier, husky, lint-staged

### Enforce "no any" in code generation
Add the following ESLint rule block and TypeScript flags to ensure generated code never uses `any`:
```json
"@typescript-eslint/no-explicit-any": ["error"],
"@typescript-eslint/explicit-function-return-type": ["warn", { "allowExpressions": true }]
```

### Developer notes for AI/code generation
- Always produce explicit types for every object and function. If a dynamic object is required, use `Record<string, unknown>` or a defined type, not `any`.
- Use Zod for runtime validation and then `z.infer<typeof schema>` to derive types.
- For DB types, prefer generated types from Supabase (`supabase gen types typescript`) and keep them updated in `src/lib/database.types.ts`.
- For E2E tests, use Playwright MCP features to sequence complex flows; consult REF MCP docs for exact API and playbook formats.
-
## 15) Operational reports, observability, privacy, rate-limits, email templates, and migration guidance

This section fills gaps for operational reporting, observability, privacy/PII guidance, API throttling, sample email templates, and detailed safe-migration guidance. It is intended to be part of the authoritative `PROMPT.md` and must be followed by developers and reviewers.

15.1 Operational reporting (requirements and sample SQL)

- Goal: provide a set of repeatable, auditable reports for daily operations, compliance, HR, and finance. Reports must be reproducible by running a single RPC or SQL script with parameters (month, year, department, user_id, format).
- Delivery formats: JSON (API), CSV (download), and large export links (signed Supabase Storage link for >100k rows). All exported files must include a manifest JSON containing applied filters, generated_at (ISO), generated_by (user id or system), and schema version.
- Required scheduled reports (minimum):
  - Daily Document Expiry Report (admins): rows of documents with expiry_date within configured thresholds; include document.id, name, owner (employee_id), owner_email (if notify_owner enabled), expiry_date, notify_thresholds, stop_notifications, last_notified_at, storage_path, signed_url_expires_at (if requested), department, and metadata summary. SQL example:

```sql
SELECT id, name, uploaded_by AS owner_id, expiry_date, metadata ->> 'notify_thresholds' AS notify_thresholds,
       metadata ->> 'notify_frequency' AS notify_frequency, metadata ->> 'stop_notifications' AS stop_notifications,
       (SELECT email FROM employees e WHERE e.id = company_documents.uploaded_by) AS owner_email,
       storage_path, created_at
FROM public.company_documents
WHERE expiry_date IS NOT NULL
  AND expiry_date BETWEEN current_date AND current_date + interval '90 days'
ORDER BY expiry_date ASC;
```

  - Monthly Leave Summary (per department / company): aggregated by month/year showing totals requested, approved, rejected, cancelled, total_days. Use `leave_aggregates_view` or the RPC `admin_search_leave_records`. Sample SQL to power CSV export:

```sql
SELECT user_id, user_name, month, year, total_requested, total_approved, total_rejected, total_cancelled, total_days
FROM public.leave_aggregates_view
WHERE year = $1 AND (month = $2 OR $2 IS NULL)
ORDER BY user_name, month;
```

  - Ad-hoc HR Audit (sensitive): list of employees with leave balances and documents expiring within 365 days. Include audit_logs references for changes. This report requires admin-only access and an approval step before export (see privacy controls below).

  - Weekly Manager Summary: each manager receives a weekly email with their team's upcoming leaves (next 14 days) and pending approvals. Fields: manager_id, team_member_id, team_member_name, leave_id, start_date, end_date, days_count, status.

  - Quarterly Retention Report: shows counts of documents and employee records approaching retention limits and recommended archival candidates.

15.2 Scheduled reports & exports (architecture and operational rules)

- Scheduling: implement scheduled exports as Edge Functions or server-side cron jobs (GitHub Actions, Supabase Scheduled Functions). Use the admin-only `admin_search_leave_records` Edge Function for heavy queries and have it stream results to Supabase Storage when result sets exceed `REPORT_STREAM_THRESHOLD` (configurable env var).
- Naming & retention: export files pushed to `reports/` in Supabase Storage with names of pattern `{env}/{yyyyMMdd}/{report-name}-{paramsHash}.csv`. Retain reports for a default of 90 days unless overridden by `REPORT_RETENTION_DAYS`.
- Access: signed URLs for exports must be time-limited (default 24 hours) and require an audit log entry when generated. Generation must capture requesting admin id and IP address (if available).
- Concurrency & backpressure: schedule workers should respect `NOTIFICATION_BATCH_SIZE` and `REPORT_STREAM_BATCH_SIZE`, and use cursor-based streaming for large datasets.

15.3 Observability, logging, and auditability

- Structured logging: all server-side code and Edge Functions must log in structured JSON with fields: timestamp (ISO), level, service, function, env, request_id (UUID), user_id (if authenticated), trace_id (if available), message, and metadata (object). Example log entry:

```json
{"timestamp":"2025-10-12T02:00:00Z","level":"info","service":"edge/check-document-expiry","request_id":"...","user_id":null,"message":"scanned 37 documents, 5 matched thresholds","metadata":{"scanned":37,"matched":5}}
```

- Audit logs: all admin actions (user CRUD, document stop/renew, exports, manual notification triggers) must be recorded to `audit_logs` with before/after JSON snapshots, action string, admin_user, and IP address when available. The `audit_logs` table schema must include: id, user_id (actor), action, table_name, record_id, old jsonb, new jsonb, metadata jsonb, created_at.
- Error & exception handling: capture exceptions to Sentry (or equivalent) including breadcrumbs, request context, and trace ids. For transient errors, implement retries with exponential backoff; log retry attempts.
- Metrics: expose application metrics via a Prometheus-compatible endpoint (or push to cloud provider metrics). Minimum metrics:
  - api.request.count (labels: route, method, status)
  - api.request.duration_seconds (histogram)
  - edge.function.invocations (labels: function_name, result)
  - notifications.sent_total (labels: type=email|in-app, result=success|failure)
  - notification_queue.length
  - document.expiry.matches (counter)

- Dashboards & alerts: create Grafana/CloudWatch/Datadog dashboards for:
  - API latency and error rate (>1% errors in 5m = alert)
  - Cron job failures or increases in retries
  - Large export job failures
  - Document expiry notification errors
  - High volume of audit_logs writes (possible abuse)

- Alerting: define alert runbooks and SLOs. Example SLOs:
  - Availability: frontend API < 99.9% Uptime
  - Notification delivery: 95% of emails delivered within 5 minutes of scheduling (non-batch)
  - Export job success: 99% success for jobs < 1 hour

15.4 Privacy, PII handling, and compliance

- Data minimization: API exports and emails should only include the minimal fields required. For employee-directed emails (owners), avoid including sensitive metadata (SSNs, passport numbers). If the document metadata contains highly-sensitive fields, redact or omit them in emails and exports unless explicitly requested by an admin and approved via an audit step.
- Access control: only Admin/HR roles can generate full PII-bearing reports. Manager-level exports must be limited to their team and must not include PII beyond name and business contact email.
- Consent & data subjects' rights: implement endpoints for data access and deletion that produce an audit trail. Respect `is_active` as soft-delete flag; provide an anonymize routine that replaces PII with pseudonymous identifiers and stores original data in an encrypted archive for compliance (if required).
- Retention & deletion policy: document retention windows for employee records and documents (default: documents = 7 years; employee records = 10 years) with ability to override per-company policy. Provide a retention enforcement job that marks items for archival and notifies admins before deletion.

15.5 Rate-limiting, throttling, and abuse protection

- API rate limits (recommended defaults):
  - Authenticated users: 600 requests / 10 minutes (burstable)
  - Anonymous / public endpoints: 60 requests / minute
  - Heavy endpoints (admin export, calendar events RPC): require stricter quotas and background job submission (limit to 1 concurrent export per admin, queue additional requests).

- Implementation points:
  - Place API gateway or edge middleware (Vercel Edge, Cloudflare Workers, or built-in Next middleware) to enforce global quotas and IP-based throttles.
  - Use a leaky-bucket or token-bucket strategy stored in Redis (or Supabase Realtime/kv if available) for distributed rate limiting.
  - For Edge Functions that may be abused (e.g., `admin_search_leave_records`), require a short-lived export task token and enforce a per-admin concurrency limit. Non-interactive requests should be queued and processed by a worker.

15.6 Email templates and content guidance (examples)

All outgoing emails must be plain-text + HTML multipart, include an unsubscribe or manage-notifications link for user-targeted emails, and include the company's support footer. Signed URLs to documents must be short-lived and must not be embedded as permanent links.

- Daily consolidated admin expiry notification (subject): "[Action Required] Documents expiring within 30 days — {company_name}"

HTML body (summary + table):

Subject: [Action Required] Documents expiring soon — {company_name}

Hi {admin_name},

The following documents are approaching expiry within the next {threshold} days. Please review and take action.

| Document | Owner | Expiry | Notify Owner |
|---|---|---:|:---:|
| {doc_name} | {owner_name} ({owner_email}) | {expiry_date} | {yes/no} |

View details: {admin_document_list_url}

This message was generated by the Leave Management System on {generated_at}.

--
{company_name} Operations

Example plain-text template (employee reminder):

Subject: Document expiring: {document_name} on {expiry_date}

Hi {first_name},

This is a reminder that your document "{document_name}" is set to expire on {expiry_date}. Please renew or upload a new copy to avoid interruptions.

Access your document securely: {signed_url}

If you do not wish to receive these reminders for this document, an administrator can toggle "Stop Notifications" on the document record.

Regards,
{company_name} HR

15.7 Migration guidance & safe deploy practices (detailed)

- Core principle: NEVER run potentially-destructive migrations against production without: (1) schema introspection, (2) a dry-run verification, (3) a tested fallback/restore plan, and (4) explicit approval logged in `audit_logs`.

- Pre-deploy schema checks (automated procedure):
  1. Use a server-side admin client (must run with `SUPABASE_SERVICE_ROLE_KEY`) to query `information_schema.tables` and `information_schema.columns` for the target database.
  2. Compare the live schema against the migration plan (the migration's expected tables/columns/functions). If expected columns do not exist or names differ (e.g., `department` vs `department_id`), abort and surface a detailed diff with remediation recommendations.
  3. Enforce idempotent DDL patterns in migrations where appropriate:

```sql
-- create table if not exists
CREATE TABLE IF NOT EXISTS public.company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
-- add column if not exists (Postgres >= 11 workaround)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_documents' AND column_name='notify_thresholds') THEN
    ALTER TABLE public.company_documents ADD COLUMN notify_thresholds text;
  END IF;
END $$;
```

  4. Use transactional migrations for additive changes where possible. For migrations that cannot be wrapped in a transaction (e.g., certain Postgres DDL in older versions), provide a compensating migration script (rollback) and a runbook.
  5. Backups: before applying migrations in production, create a logical backup (pg_dump of affected tables) and/or snapshot the DB. Store backup location in the migration run metadata.

- Safe rollback practice:
  - Maintain reversible migrations (create vs drop). For destructive operations (DROP COLUMN, DROP TABLE), require two-stage rollout: (A) mark the column deprecated and stop writes (zeroing or copying to new column), (B) after a grace period and verifying zero writes, remove the column in a follow-up migration.

- Migration deployment checklist (CI/Runbook):
  - Run `scripts/check-schema-introspection.js --target env` (script connects with service role key and verifies expected structure).
  - If checks pass, run migrations in a maintenance window and monitor `audit_logs`, `error_rate`, and slow queries for degradation.
  - If a migration fails, follow the rollback runbook using the pre-created backups and notify stakeholders.

15.8 Data backup, retention & archival

- Backups: nightly logical backups for small DBs and hourly WAL archiving for production-sized DBs. Verify backup integrity weekly by restoring to a staging environment using an automated scheduled job.
- Archival: move older documents to a cold-storage bucket and replace public storage paths with an archival pointer; keep an index in `archived_documents` table to allow retrieval for compliance.
- Retention policy enforcement job: runs monthly, flags items past retention thresholds for admin review, and then deletes after a 30-day grace period unless a retention exception is recorded.

15.9 Performance & scaling considerations for reports and notifications

- Large query patterns: add pagination, use indexed queries (created_at, expiry_date), and prefer `WHERE ... BETWEEN` with appropriate index support. For exports, use cursor-based streaming and avoid loading entire result sets into memory.
- Notification scaling: send emails in batches with concurrency limits and use provider webhooks for delivery status. For very large recipient lists, use provider-native export/import or batch mechanisms rather than sending individually from the app.

15.10 Tests, monitoring, and verification for operational code

- Unit tests: add tests for report-generator utilities and SQL-building functions (Vitest). Mock DB responses where practical.
- Integration tests: run on a CI staging Supabase instance seeded with representative datasets to validate exports, signed-URL generation, and email webhook flows.
- E2E: add Playwright tests that (a) trigger a manual admin `notify-expiry` call and verify that `notification_logs` rows are created, and (b) verify that admin exports with `export=csv` produce a downloadable CSV with expected headers.

15.11 Documentation & runbooks

- Add runbooks under `docs/runbooks/` for: migrations, export failure handling, notification retry handling, incident response, and data deletion request handling. Each runbook must include commands to reproduce, example queries to verify state, and rollback steps.

15.12 Appendices: example queries, CSV headers, and manifest structure

- Example CSV header for Monthly Leave Summary:
  - user_id,user_name,month,year,total_requested,total_approved,total_rejected,total_cancelled,total_days

- Example manifest JSON for any export:
```json
{
  "report_name":"monthly_leave_summary",
  "params":{"year":2025,"month":10},
  "generated_at":"2025-10-12T03:10:00Z",
  "generated_by":"admin:uuid",
  "file_name":"monthly_leave_summary-202510-abc123.csv",
  "row_count":5234,
  "schema_version":"v1"
}
```

---

That completes the additional operational, reporting, and migration guidance to make the `PROMPT.md` actionable and PR-ready. Follow these sections as mandatory operational requirements (subject to the exceptions process in the prompt).
---
