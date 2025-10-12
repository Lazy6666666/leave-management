## PR Review Checklist — Leave Management System

This checklist is intended for reviewers to verify that a PR complies with the authoritative `PROMPT.md`, best practices documentation, and repository rules before merging.

Required checks (must pass):

### 📋 Documentation & Best Practices Compliance
- [ ] The `PROMPT.md` in `docs/` is not contradicted by the PR (for mandated areas). If there is a conflict, the PR must include an update to `docs/PROMPT.md` or a `docs/design-decisions.md` entry explaining the exception.
- [ ] No new `.md` files are added outside `docs/`.
- [ ] **Best Practices Compliance**: Changes align with relevant best practices documentation:
  - [ ] `docs/best-practices/security.md` - Security measures implemented correctly
  - [ ] `docs/best-practices/performance.md` - Performance optimizations applied where applicable
  - [ ] `docs/best-practices/data-management.md` - Data handling follows GDPR and retention policies
  - [ ] `docs/best-practices/deployment-operations.md` - Deployment and operational procedures followed
  - [ ] `docs/best-practices/design-system.md` - UI components follow design system guidelines
  - [ ] `docs/best-practices/testing.md` - Testing strategies implemented appropriately

### 🏗️ Folder Structure & Architecture
- [ ] All new automation scripts live under `scripts/` or `supabase/migrations/`.
- [ ] No new top-level folders were added without an entry in `docs/design-decisions.md`.
- [ ] **Architecture Compliance**: Code follows patterns established in best practices docs:
  - [ ] Next.js App Router patterns from `nextjs-vercel.md`
  - [ ] Supabase integration patterns from `supabase-backend.md`
  - [ ] Component architecture from `design-system.md`

### 🎨 UI / Design System
- [ ] Core UI components (buttons, inputs, modals, tables, badges, calendar tiles) use wrappers from `src/components/ui/` and `shadcn/ui` where mandated.
- [ ] No inline colors or styles bypassing CSS tokens in `docs/design-system.md` are present in the mandated areas.
- [ ] **Design System Compliance**:
  - [ ] Components use CSS custom properties for theming
  - [ ] `data-mcp`/`data-test` attributes included for testing
  - [ ] Responsive design patterns followed
  - [ ] Accessibility features implemented

### 🔒 Security & Data Management
- [ ] If DB schema or migrations were changed, RLS policies are included and enabled in the migration files.
- [ ] **Security Compliance** (`security.md`):
  - [ ] OWASP guidelines followed for new features
  - [ ] File upload security measures implemented
  - [ ] Security headers properly configured
  - [ ] Authentication middleware applied where needed
- [ ] **Data Management Compliance** (`data-management.md`):
  - [ ] GDPR compliance measures implemented for user data
  - [ ] Data retention policies applied
  - [ ] Audit logging implemented for sensitive operations
  - [ ] Data validation rules followed

### 🧪 Testing & Quality Assurance
- [ ] Unit tests / integration tests added for new logic (Vitest) where applicable.
- [ ] Playwright (MCP) tests added/updated for critical flows when UI changes affect flows.
- [ ] Accessibility checks (axe) are present for changed UIs.
- [ ] **Testing Best Practices** (`testing.md`):
  - [ ] E2E tests cover critical user flows
  - [ ] Accessibility tests included for UI changes
  - [ ] Performance tests added for optimization changes
  - [ ] Visual regression tests considered for UI updates

### ⚡ Performance & Operations
- [ ] **Performance Compliance** (`performance.md`):
  - [ ] Core Web Vitals optimizations applied where relevant
  - [ ] Bundle optimization techniques used for new features
  - [ ] Database query optimization implemented
  - [ ] Caching strategies applied appropriately
- [ ] **Deployment & Operations** (`deployment-operations.md`):
  - [ ] CI/CD pipeline updates included if needed
  - [ ] Monitoring and alerting configurations updated
  - [ ] Rollback procedures documented for risky changes

### 🔧 CI / Lint / Type Safety
- [ ] `npm run lint` passes.
- [ ] `npm run type-check` passes (no `any` usage introduced).
- [ ] `npm run test` passes for unit tests.
- [ ] **Code Quality Standards**:
  - [ ] ESLint rules followed (no `any` types, explicit return types)
  - [ ] Prettier formatting applied
  - [ ] Import statements follow established patterns

### 📁 Repository Structure
- [ ] `npm run validate-structure` passes locally and in CI (no `.md` files outside `docs/`, no scripts outside `scripts/` or `supabase/migrations`).
- [ ] **Repository Rules Enforcement**:
  - [ ] All documentation in `docs/` folder
  - [ ] All scripts in `scripts/` or `supabase/migrations/`
  - [ ] No conflicting file placements

### 📊 Additional Quality Checks
- [ ] **Error Handling**: Proper error handling implemented for new features
- [ ] **Logging**: Appropriate logging added for debugging and monitoring
- [ ] **Documentation**: Code comments and documentation updated
- [ ] **Breaking Changes**: Breaking changes clearly documented if any

---

## Review Process Guidelines

### Mandatory Review Requirements
- **Best Practices Review**: All PRs must be reviewed against the relevant best practices documentation
- **Security Review**: Any security-related changes require additional security team review
- **Performance Review**: Performance-impacting changes require performance team review
- **Testing Review**: New features require testing team review for test coverage

### Exception Process
- If a change touches a mandated area from `PROMPT.md` or best practices docs (design tokens, shadcn usage, RLS, API contract, security, performance), the author must either:
  1. Follow the established patterns, OR
  2. Create `docs/design-decisions.md` describing the exception with:
     - Reasons for deviation
     - Alternatives evaluated
     - Risk assessment
     - Migration plan
     - Obtain explicit approval from project owners

### Non-Mandated Areas
- For non-mandated areas, reasonable alternatives are allowed but should be documented
- Best practices should still be considered as guidance even for non-mandated areas

### Sign-off Requirements
Reviewer must:
1. ✅ Check every applicable box above
2. ✅ Add detailed comments explaining any exceptions or concerns
3. ✅ Reference specific best practices documents used for review
4. ✅ Add a single-line approval comment: `LGTM - Reviewed against pr-checklist.md and best practices`

### Post-Merge Validation
- [ ] CI pipeline passes all checks
- [ ] Best practices validation scripts pass
- [ ] No regressions introduced
- [ ] Documentation updated if needed

---

## Quick Reference: Best Practices by Domain

| Domain | Document | Key Areas |
|--------|----------|-----------|
| 🔒 **Security** | `security.md` | OWASP, file uploads, headers, auth middleware |
| ⚡ **Performance** | `performance.md` | Core Web Vitals, caching, bundle optimization |
| 🎨 **Design** | `design-system.md` | shadcn/ui, Tailwind tokens, accessibility |
| 🧪 **Testing** | `testing.md` | Playwright E2E, Vitest, accessibility testing |
| 🚀 **Deployment** | `deployment-operations.md` | CI/CD, monitoring, incident response |
| 💾 **Data** | `data-management.md` | GDPR, migrations, audit trails, retention |
| 🔧 **Backend** | `supabase-backend.md` | RLS policies, Edge Functions, query optimization |
| 🌐 **Frontend** | `nextjs-vercel.md` | App Router, server components, deployment |

**Note**: Always reference the specific best practices document relevant to your changes during code review.
