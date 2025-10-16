# Supabase Backend Best Practices
## Table of Contents
- [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
- [Edge Functions](#edge-functions)
- [Authentication Patterns](#authentication-patterns)
- [Storage Security](#storage-security)
- [Realtime Authorization](#realtime-authorization)
- [Database Migrations](#database-migrations)
- [Query Optimization](#query-optimization)

## Row-Level Security (RLS) Policies

Design principles
- Enable RLS on every user-facing table. Avoid FOR ALL unless truly necessary; prefer separate SELECT/INSERT/UPDATE/DELETE policies.
- Use helper functions (e.g., get_employee_id_by_supabase_uid, get_user_role) and avoid leaking sensitive information in USING/WITH CHECK expressions.
- Follow least privilege: self, approver, department manager, admin/hr tiers as separate policies.

Annotate API route handlers with RLS references
- Add a non-functional comment header listing the exact policies for the table and operation, and link to docs/backend-functions-and-policies.md.
- This improves code reviewer awareness, prevents accidental overreach, and speeds up debugging.

Template
```
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.<table_name>
- GET: SELECT policy names
- POST: INSERT policy names
- PUT: UPDATE policy names
- DELETE: DELETE policy names
Related tables/policies:
- <other tables involved>
*/
```

Examples
- Leaves collection route
```
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.leaves
- GET: SELECT – leaves_requester_select, leaves_approver_select, leaves_department_select, leaves_admin_select
- POST: INSERT – leaves_requester_insert
Related functions:
- check_overlapping_leaves(uuid, date, date, uuid)
- get_available_leave_days(uuid, uuid, integer)
*/
```

- Documents detail route
```
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.documents
- GET: SELECT – own uploaded, shared, team documents
- PUT: UPDATE – update own documents (uploaded_by or employee_id matches)
- DELETE: DELETE – delete own documents (uploaded_by or employee_id matches)
Related tables/policies: document_shares, document_audit_logs
*/
```

Policy hygiene checklist
- [ ] RLS enabled on table
- [ ] Separate policies for SELECT/INSERT/UPDATE/DELETE
- [ ] USING clauses gate read access correctly
- [ ] WITH CHECK clauses gate writes/updates correctly
- [ ] Helper functions SECURITY DEFINER and audited
- [ ] Comments explain rationale for non-trivial policies

## Edge Functions
- Use for scheduled jobs, external integrations, or logic requiring secrets isolation.
- Keep function code in backend/supabase/functions and deploy with `supabase functions deploy`.
- Prefer database functions/triggers for intra-database business logic; use Edge Functions for HTTP exposure and orchestration.

## Authentication Patterns
- Derive employee_id with get_employee_id_by_supabase_uid(auth.uid()) in policies/functions.
- Avoid trusting client-requested IDs; verify via auth.uid() joins in policies.

## Storage Security
- Restrict document access via documents and document_shares tables, not public buckets.
- Validate shares (is_active, expires_at) in policies.

## Realtime Authorization
- Ensure channels align with RLS; avoid broadcasting sensitive rows to unauthorized clients.

## Database Migrations
- Maintain a single source of truth in docs/backend-functions-and-policies.md.
- On each migration:
  - Parse line-by-line to extract function signatures, triggers, policy USING/WITH CHECK clauses.
  - Update the documentation with exact definitions and link to frontend modules.
  - Keep a Table of Contents with anchors for quick navigation.
- Add comments to migrations explaining complex policies or triggers.

## Query Optimization
- Add targeted indexes for foreign keys used in policy checks (e.g., employees.supabase_id).
- Use EXPLAIN ANALYZE for heavy report queries and ensure policies don’t force sequential scans.