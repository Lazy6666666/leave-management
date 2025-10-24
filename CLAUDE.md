# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leave Management System: A full-stack Next.js 15 application with Supabase backend for employee leave request management, approval workflows, and role-based access control.

**Stack**: Next.js 15 (App Router), TypeScript, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS, shadcn/ui

## Development Commands

### Frontend Development
```bash
# Navigate to frontend directory first
cd frontend

# Development server (runs on http://localhost:3000)
npm run dev

# Type checking (must pass before commits)
npm run typecheck

# Linting (must pass with zero warnings)
npm run lint

# Combined checks (typecheck + lint)
npm run check

# Production build
npm run build

# Start production server
npm start
```

### Testing
```bash
# Unit & integration tests (Vitest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Performance tests (Lighthouse CI)
npm run test:performance

# Security tests
npm run test:security
```

### Root-level Commands
From repository root, commands automatically target the frontend workspace:
```bash
npm run dev          # Same as cd frontend && npm run dev
npm run build        # Build frontend
npm test             # Run frontend tests
npm run lint         # Lint frontend
npm run type-check   # Type check frontend
```

### Running Single Tests
```bash
# Run specific test file
npx vitest src/__tests__/path/to/test.test.ts

# Run tests in watch mode
npx vitest watch

# Run specific E2E test
npx playwright test tests/e2e/specific-test.spec.ts

# Run E2E tests with UI
npx playwright test --ui
```

## Architecture Overview

### Monorepo Structure
- **frontend/**: Next.js 15 application (main codebase)
- **backend/supabase/**: Database migrations, RLS policies, and Edge Functions
- **docs/**: Product requirements, best practices, user stories

### Frontend Architecture

**App Router Organization**:
- `src/app/`: Next.js 15 App Router pages and API routes
  - `dashboard/`: Protected dashboard routes with role-based pages
  - `auth/`: Authentication pages (login, register, reset-password)
  - `api/`: Next.js API routes (thin wrappers over Supabase)
- `src/components/`: Reusable React components
  - `ui/`: shadcn/ui primitives (button, dialog, form, etc.)
  - `auth/`: Authentication components (login/register forms, permission gates)
  - `layout/`: Layout components (header, nav, footer)
- `src/lib/`: Core utilities and services
  - `supabase/`: Supabase client factories (client, server, middleware)
  - `auth/`: Permission system and RBAC utilities
  - `services/`: Business logic services (RBAC, calendar, notifications, leave-balance)
  - `validations/`: Zod schemas for form and API validation
- `src/hooks/`: Custom React hooks (use-permissions, use-toast)
- `src/types/`: TypeScript type definitions

**State Management**:
- React Query (@tanstack/react-query) for server state
- React Hook Form + Zod for form state and validation
- No global client state library (using React Context where needed)

### Backend Architecture

**Supabase Integration**:
- PostgreSQL database with custom types (`user_role`, `leave_status`)
- Row-Level Security (RLS) policies for data access control
- Supabase Auth for user authentication
- Supabase Storage for document management
- Database functions for business logic

**Key Database Tables**:
- `employees`: User profiles linked to auth.users via supabase_id
- `leaves`: Leave requests with status workflow (pending → approved/rejected/cancelled)
- `leave_types`: Configurable leave types with allocation rules
- `leave_balances`: Employee leave balances by type and year
- `company_documents`: Document storage with expiry tracking
- `audit_logs`: Comprehensive audit trail

**RLS Policy Pattern**:
Every API route handler MUST include an RLS reference comment header:
```typescript
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.leaves
- GET: SELECT – leaves_requester_select, leaves_approver_select
- POST: INSERT – leaves_requester_insert
Related functions: check_overlapping_leaves, get_available_leave_days
*/
```

### Authentication Flow

1. Supabase Auth handles JWT tokens and sessions
2. Middleware (`src/middleware.ts`) enforces route protection and role-based access
3. Permission system (`src/lib/auth/permissions.ts`) defines granular permissions per role
4. Components use `<PermissionGate>` or `usePermissions()` hook for UI authorization
5. Server-side auth uses `createServerClient()` from `@/lib/supabase/server`
6. Client-side auth uses `createClient()` from `@/lib/supabase/client`

**User Roles**: employee, manager, hr, admin (hierarchical permissions)

### Key Design Patterns

**Server Components First**: Use React Server Components by default, Client Components only when needed (forms, interactivity)

**API Route Structure**: Next.js API routes in `src/app/api/` act as thin wrappers:
1. Authenticate user via Supabase client
2. Validate request with Zod schema
3. Execute Supabase query (RLS policies enforce authorization)
4. Return standardized JSON response

**Permission Checks**: Always check permissions at THREE layers:
1. Middleware (route-level protection)
2. API routes (operation-level authorization)
3. RLS policies (row-level data access)

**Form Pattern**: All forms use React Hook Form + Zod validation + shadcn/ui components

## Critical Development Guidelines

### Before Making Changes

1. **Check RLS Policies**: Review `backend/supabase/migrations/` to understand data access rules
2. **Understand Permission Model**: Review `src/lib/auth/permissions.ts` for role capabilities
3. **Follow Existing Patterns**: Match component structure and service patterns in codebase

### When Adding Features

1. **Database Changes**: Create new migration in `backend/supabase/migrations/`
2. **Types**: Generate types with Supabase CLI: `supabase gen types typescript --local > src/lib/database.types.ts`
3. **RLS Policies**: Add RLS policies in migration, document in code comments
4. **API Routes**: Add RLS reference comment, validate with Zod, enforce permissions
5. **Components**: Use shadcn/ui primitives, follow existing component patterns
6. **Tests**: Add unit tests (Vitest) and E2E tests (Playwright) for critical flows

### Security Requirements

- **Never bypass RLS**: Always use Supabase client, never raw SQL from frontend
- **Validate all inputs**: Use Zod schemas for all API routes and forms
- **Check permissions**: Use `hasPermission()` helper before operations
- **Audit trail**: Use `audit_logs` table for sensitive operations
- **Environment variables**: Never commit `.env` files, use `.env.example` as template

### Testing Requirements

- Unit tests for all business logic in `src/lib/services/`
- Component tests for complex UI components
- E2E tests for critical user flows (login, leave request, approval)
- Accessibility tests with @axe-core/playwright
- Performance tests with Lighthouse CI (Core Web Vitals targets)

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types without justification
- **ESLint**: Zero warnings policy (`--max-warnings=0`)
- **Formatting**: Prettier for consistent formatting
- **Imports**: Use `@/` alias for absolute imports
- **Comments**: Add JSDoc comments for public functions and complex logic

## Common Development Scenarios

### Adding a New Leave Type Feature
1. Add migration to create/modify `leave_types` table
2. Update Zod schemas in `src/lib/validations/leave.ts`
3. Create/update API route in `src/app/api/leave-types/`
4. Update UI components in `src/components/`
5. Add RLS policies for new fields
6. Write tests for new functionality

### Debugging RLS Issues
1. Check Supabase logs in dashboard
2. Review policy definitions in migrations
3. Test queries in Supabase SQL editor with `auth.uid()`
4. Verify employee record has correct role and department
5. Check `docs/backend-functions-and-policies.md` for policy documentation

### Adding a New Protected Route
1. Create page in `src/app/dashboard/[route]/page.tsx`
2. Add route pattern to middleware config
3. Add permission checks using `<PermissionGate>` or `hasPermission()`
4. Update navigation in `src/config/dashboard.ts`
5. Add E2E test for route protection

## Important Files Reference

- `src/middleware.ts`: Route protection and role-based access
- `src/lib/auth/permissions.ts`: Permission definitions and helpers
- `src/lib/supabase/`: Supabase client creation (client, server, middleware)
- `docs/PRD.md`: Product requirements document
- `docs/best-practices/supabase-backend.md`: RLS and backend patterns
- `backend/supabase/migrations/`: Database schema and RLS policies

## Documentation

- PRD and user stories in `docs/`
- Best practices in `docs/best-practices/`
- Testing checklists in `docs/testing-checklists/`
- API documentation via JSDoc comments in code
