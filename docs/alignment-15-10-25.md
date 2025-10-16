# Supabase Alignment Report — 2025-10-15

## Objective

Fully align the Supabase database schema, functions, triggers, RLS policies, and TypeScript client types with the Leave Management System for production readiness.

Project: LEAVE-MANAGEMENT
Ref: kmhahflrkddihrylhjxy

---

## Steps Performed

1) Project link
- Command: `npx supabase link --project-ref kmhahflrkddihrylhjxy`
- Result: Success (project linked)

2) Pull remote schema
- Command: `npx supabase db pull --debug`
- Result: Failed due to migration history mismatch.
- CLI output indicates remote migration versions not found in local `supabase/migrations` directory.
- Suggested repair (from CLI):
  - Run (in order):
    - `npx supabase migration repair --status reverted 20251012025842`
    - `npx supabase migration repair --status reverted 20251012025918`
    - `npx supabase migration repair --status reverted 20251012030032`
    - `npx supabase migration repair --status reverted 20251013022724`
    - `npx supabase migration repair --status applied 001`
    - `npx supabase migration repair --status applied 002`
    - `npx supabase migration repair --status applied 003`
    - `npx supabase migration repair --status applied 004`
    - `npx supabase migration repair --status applied 005`
    - `npx supabase migration repair --status applied 006`
    - `npx supabase migration repair --status applied 007`
  - Then re-run `npx supabase db pull`

3) Push local migrations
- Command: `npx supabase db push --linked`
- Result: Failed due to remote migration versions not found locally.

4) Regenerate TypeScript types
- Command: `npx supabase gen types typescript --linked > frontend/src/lib/database.types.ts`
- Result: Success (types generated in `frontend/src/lib/database.types.ts`)

5) Env validation
- Files found: `frontend/.env`, `frontend/.env.local`
- Observed:
  - `frontend/.env.local` contains:
    - `NEXT_PUBLIC_SUPABASE_URL=https://kmhahflrkddihrylhjxy.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<present>`
  - `SUPABASE_SERVICE_ROLE_KEY` is present only in `frontend/.env` placeholder. This is acceptable; service role key should not be exposed to the browser. Use server-only secrets (CI/CD or backend runtime) for service role operations.

---

## Observations & Current Alignment Status

- Database tables present remotely (confirmed earlier in this effort): `employees`, `leave_types`, `leave_balances`, `leaves`, `audit_logs`, `company_documents`.
- Missing remotely: `notifications`, `notification_preferences`, `calendar_events`, user-scoped `documents` (distinct from `company_documents`).
- Functions available include: `get_user_role`, `get_department_leave_calendar`, `is_manager_of_department`, and several leave-related helpers.
- RLS for `leaves` exists and is refined; RLS for missing tables must be added after tables are created.
- TypeScript client types were regenerated and saved into `frontend/src/lib/database.types.ts`.
- Frontend types and services: several "any" casts were found (calendar API route, calendar-event-form, notification-service, RBAC service). These should be refactored to use the regenerated Supabase types and zod schemas.
- Orphaned type: `CompanyDocument` appears defined but not used; consider removing or aligning with your future `documents` table.

---

## Recommended Remediation Plan

1) Migrations directory alignment
- The Supabase CLI expects migrations in `supabase/migrations/` at the repository root. Your local SQLs exist under `backend/supabase/migrations/`.
- Options:
  - Preferred: Move or mirror your migrations into `supabase/migrations/` (preserving order and filenames), then run `npx supabase db pull` and `npx supabase db push --linked`.
  - Or: Use `supabase migration repair` cautiously to reconcile the remote migration versions with local state. Backup before repair.

2) Create missing tables and RLS policies (if not yet present remotely)
- `notifications`, `notification_preferences`, `calendar_events`, `documents` (user-scoped). Ensure RLS is applied per requirements.

3) Refactor frontend to strong typing
- Remove all `any` casts; use `Tables<'table'>` and `Enums<'enum'>` from `frontend/src/lib/database.types.ts`.
- Use zod schemas for form values and any incoming payloads until tables are present.

4) Environment keys
- Keep service role key out of frontend. Provide it only to server-side runtimes where needed.

---

## Final Status (as of 2025-10-15)

| Category             | Status            | Notes                                                      |
|----------------------|-------------------|------------------------------------------------------------|
| Database Alignment   | Needs Repair      | Migration history mismatch between remote and local dirs   |
| Functions/Triggers   | Partially Verified| Core functions present; others depend on missing tables    |
| RLS Policies         | Partially Synced  | `leaves` refined; others to be applied post table creation |
| Environment Vars     | Validated         | URL + anon in frontend; service role not in frontend (ok)  |
| App Integration      | Partially Working | Types regenerated; remove `any` casts for full alignment   |
| Orphaned Assets      | Needs Cleanup     | `CompanyDocument` type appears unused                      |
| Documentation        | Generated         | This alignment report                                      |

---

## Next Actions

1) Decide on migration reconciliation approach (move local migrations or use `supabase migration repair`).
2) Create missing tables and apply RLS policies.
3) Refactor frontend services and forms to remove `any` and use generated Supabase types.
4) Run end-to-end tests after alignment.

---

## Commands Reference

```
cd "C:\Users\Twisted\Desktop\LEAVE-MANAGEMENT"

# Link (done)
npx supabase link --project-ref kmhahflrkddihrylhjxy

# Pull (failed due to migration mismatch; run after reconciliation)
npx supabase db pull --debug

# Push (failed due to migration mismatch; run after reconciliation)
npx supabase db push --linked

# Regenerate types (done)
npx supabase gen types typescript --linked > frontend/src/lib/database.types.ts

# Optional: Supabase Studio
npx supabase studio
```