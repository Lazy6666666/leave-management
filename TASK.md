# Leave Management System — UI/UX Enhancement & Migration Report

**Generated:** January 2025
**Project:** Leave Management System (Next.js 15 + Supabase)
**Current State:** Shadcn UI + Glassmorphism Already Implemented
**Goal:** Refine, enhance, and document the existing UI/UX system

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Architecture](#2-project-architecture)
3. [File & Dependency Map](#3-file--dependency-map)
4. [Complete Component Inventory](#4-complete-component-inventory)
5. [Frontend-Backend Connection Report](#5-frontend-backend-connection-report)
6. [Supabase Integration Summary](#6-supabase-integration-summary)
7. [UI/UX Refactor Strategy](#7-uiux-refactor-strategy)
8. [Dual-Theme Style Guide](#8-dual-theme-style-guide)
9. [Migration Roadmap](#9-migration-roadmap)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Executive Summary

### Current State Analysis

✅ **Already Implemented:**
- **Shadcn UI Components**: 40+ components fully integrated
- **Glassmorphism Design**: Implemented with backdrop-blur and transparency
- **Gradient Backgrounds**: Light and dark mode gradients in place
- **Next.js 15**: Modern App Router with server/client components
- **TypeScript**: Comprehensive type system
- **Supabase Integration**: Auth, database, storage fully functional
- **Responsive Design**: Mobile-first approach with TailwindCSS

### What This Report Provides

This is **NOT a migration guide** but rather an **enhancement and refinement strategy** for your existing Shadcn UI + Glassmorphism implementation.

**Key Focus Areas:**
1. **Documentation** of existing architecture and patterns
2. **Enhancement** recommendations for visual consistency
3. **Optimization** opportunities for performance and UX
4. **Standardization** of glassmorphism effects across components
5. **Accessibility** improvements and WCAG compliance

---

## 2. Project Architecture

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.5.4 | App Router, SSR, API Routes |
| **UI Framework** | React | 19.1.0 | Component library |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS |
| **UI Components** | Shadcn UI | Latest | Radix UI primitives |
| **State Management** | React Query | 5.90.3 | Server state & caching |
| **Forms** | React Hook Form | 7.65.0 | Form validation |
| **Validation** | Zod | 4.1.12 | Schema validation |
| **Backend** | Supabase | Latest | PostgreSQL, Auth, Storage |
| **Auth** | Supabase Auth | Latest | Email/password, session management |
| **Database** | PostgreSQL | via Supabase | Relational database with RLS |
| **Storage** | Supabase Storage | Latest | File storage with signed URLs |
| **Icons** | Lucide React | 0.545.0 | Icon library |
| **Charts** | Recharts | 3.2.1 | Data visualization |
| **Date** | date-fns | 4.1.0 | Date manipulation |
| **Theme** | next-themes | 0.4.6 | Dark/light mode switching |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Testing** | Playwright | 1.56.0 | E2E testing |
| **Testing** | Vitest | 2.1.9 | Unit testing |
| **Linting** | ESLint | 9.x | Code quality |
| **TypeScript** | TypeScript | 5.x | Type safety |

### Project Structure

```
LEAVE-MANAGEMENT/
├── frontend/
│   ├── src/
│   │   ├── app/                          # Next.js App Router
│   │   │   ├── api/                      # API Routes (28 routes)
│   │   │   │   ├── auth/callback/
│   │   │   │   ├── calendar/events/
│   │   │   │   ├── departments/
│   │   │   │   ├── documents/
│   │   │   │   ├── leave-requests/
│   │   │   │   ├── leaves/
│   │   │   │   ├── leave-types/
│   │   │   │   ├── notifications/
│   │   │   │   ├── reports/
│   │   │   │   └── storage/documents/
│   │   │   ├── auth/                     # Auth Pages (6 pages)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── reset-password/
│   │   │   │   ├── update-password/
│   │   │   │   ├── verify-email/
│   │   │   │   └── auth-code-error/
│   │   │   ├── dashboard/                # Dashboard Pages (17 pages)
│   │   │   │   ├── admin/
│   │   │   │   │   ├── audit-logs/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── roles/
│   │   │   │   │   └── users/
│   │   │   │   ├── approvals/
│   │   │   │   ├── calendar/
│   │   │   │   ├── diagnostics/
│   │   │   │   ├── documents/
│   │   │   │   ├── leaves/
│   │   │   │   │   ├── new/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   └── reports/
│   │   │   ├── login/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css               # Glassmorphism & theme styles
│   │   ├── components/                   # React Components (70+ components)
│   │   │   ├── ui/                       # Shadcn UI Components (20+)
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── date-range-picker.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── textarea.tsx
│   │   │   ├── admin/                    # Admin Components (4)
│   │   │   │   ├── admin-dashboard.tsx
│   │   │   │   ├── audit-log-viewer.tsx
│   │   │   │   ├── holiday-management.tsx
│   │   │   │   ├── role-management.tsx
│   │   │   │   └── user-management.tsx
│   │   │   ├── auth/                     # Auth Components (6)
│   │   │   │   ├── auth-provider.tsx
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── password-reset-form.tsx
│   │   │   │   ├── permission-gate.tsx
│   │   │   │   ├── protected-route.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── update-password-form.tsx
│   │   │   │   └── user-nav.tsx
│   │   │   ├── calendar/                 # Calendar Components (3)
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── calendar-event-form.tsx
│   │   │   │   └── team-calendar.tsx
│   │   │   ├── documents/                # Document Components (4)
│   │   │   │   ├── document-categorization.tsx
│   │   │   │   ├── document-export-dialog.tsx
│   │   │   │   ├── document-list.tsx
│   │   │   │   └── document-upload.tsx
│   │   │   ├── layout/                   # Layout Components (3)
│   │   │   │   ├── header.tsx
│   │   │   │   ├── main-nav.tsx
│   │   │   │   └── site-footer.tsx
│   │   │   ├── leave/                    # Leave Components (3)
│   │   │   │   ├── leave-request-detail.tsx
│   │   │   │   ├── leave-request-form.tsx
│   │   │   │   └── leave-request-list.tsx
│   │   │   ├── leave-balance/            # Leave Balance (1)
│   │   │   │   └── leave-balance-widget.tsx
│   │   │   ├── leave-request/            # Leave Request (1)
│   │   │   │   └── leave-approval-workflow.tsx
│   │   │   ├── notifications/            # Notification Components (2)
│   │   │   │   ├── notification-bell.tsx
│   │   │   │   └── notification-center.tsx
│   │   │   ├── providers/                # Providers (1)
│   │   │   │   └── app-providers.tsx
│   │   │   ├── reports/                  # Report Components (5)
│   │   │   │   ├── bar-chart.tsx
│   │   │   │   ├── line-chart.tsx
│   │   │   │   ├── pie-chart.tsx
│   │   │   │   ├── report-export-dialog.tsx
│   │   │   │   └── reporting-dashboard.tsx
│   │   │   ├── icons.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── mode-toggle.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── hooks/                        # Custom Hooks (2)
│   │   │   ├── use-permissions.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/                          # Utilities & Services
│   │   │   ├── auth/
│   │   │   │   └── permissions.ts
│   │   │   ├── notifications/
│   │   │   │   ├── document-expiry.ts
│   │   │   │   └── sendgrid.ts
│   │   │   ├── services/
│   │   │   │   ├── calendar-service.ts
│   │   │   │   ├── leave-balance-service.ts
│   │   │   │   ├── notification-service.ts
│   │   │   │   └── rbac-service.ts
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── middleware.ts
│   │   │   │   └── server.ts
│   │   │   ├── validations/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── calendar-documents-reporting.ts
│   │   │   │   ├── employee.ts
│   │   │   │   └── leave.ts
│   │   │   ├── database.types.ts
│   │   │   ├── diagnostics.ts
│   │   │   ├── session.ts
│   │   │   └── utils.ts
│   │   ├── types/                        # TypeScript Types
│   │   │   ├── calendar-documents-reporting.ts
│   │   │   ├── index.ts
│   │   │   └── supabase.ts
│   │   ├── config/
│   │   ├── middleware.ts
│   │   └── tests/
│   ├── components.json                   # Shadcn UI config
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── package.json
│   └── playwright.config.ts
├── backend/
│   └── supabase/
│       ├── migrations/                   # Database migrations (8 files)
│       │   ├── 001_create_core_tables.sql
│       │   ├── 002_create_rls_policies.sql
│       │   ├── 003_create_business_functions.sql
│       │   ├── 004_refine_rls_leaves.sql
│       │   ├── 005_calendar_and_documents.sql
│       │   ├── 006_rls_calendar_documents_reporting.sql
│       │   ├── 007_create_user_integrations_table.sql
│       │   └── 011_fix_employees_rls_recursion.sql
│       └── functions/
│           └── create-test-users/
└── docs/
    ├── README.md
    ├── AUDIT.md
    ├── TESTING-CHECKLIST.md
    └── stories/
```

---

## 3. File & Dependency Map

### Frontend Dependencies

**Core Framework:**
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "^5"
}
```

**Shadcn UI & Radix Primitives:**
```json
{
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13"
}
```

**Supabase Integration:**
```json
{
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.7.0"
}
```

**Form Management:**
```json
{
  "react-hook-form": "^7.65.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.12"
}
```

**State Management:**
```json
{
  "@tanstack/react-query": "^5.90.3"
}
```

**UI Utilities:**
```json
{
  "class-variance-authority": "^0.7.1",
  "cmdk": "^1.1.1",
  "lucide-react": "^0.545.0",
  "sonner": "^2.0.7",
  "next-themes": "^0.4.6"
}
```

**Date & Data Visualization:**
```json
{
  "date-fns": "^4.1.0",
  "react-day-picker": "^9.11.1",
  "recharts": "^3.2.1"
}
```

**File Upload:**
```json
{
  "react-dropzone": "^14.3.8"
}
```

**Styling:**
```json
{
  "tailwindcss": "^4",
  "tailwindcss-animate": "^1.0.7",
  "@tailwindcss/postcss": "^4"
}
```

### Backend Dependencies

**Supabase Services:**
- PostgreSQL database with RLS (Row-Level Security)
- Supabase Auth for authentication
- Supabase Storage for file management
- Edge Functions (optional, one function present)

---

## 4. Complete Component Inventory

### 4.1 Shadcn UI Components (Radix-based)

| Component | File Path | Current Status | Glassmorphism | Dependencies | Usage |
|-----------|-----------|---------------|---------------|--------------|-------|
| **Button** | `ui/button.tsx` | ✅ In Use | Partial | Radix Slot, CVA | Forms, actions, navigation |
| **Card** | `ui/card.tsx` | ✅ In Use | ✅ Yes (`modern-card` class) | None | Dashboard stats, content containers |
| **Input** | `ui/input.tsx` | ✅ In Use | ✅ Yes (`input-glass` class) | None | Forms, search fields |
| **Label** | `ui/label.tsx` | ✅ In Use | No | Radix Label | Form field labels |
| **Select** | `ui/select.tsx` | ✅ In Use | Partial | Radix Select | Dropdowns, filters |
| **Dialog** | `ui/dialog.tsx` | ✅ In Use | Partial | Radix Dialog | Modals, confirmations |
| **Checkbox** | `ui/checkbox.tsx` | ✅ In Use | No | Radix Checkbox | Forms, selection |
| **Textarea** | `ui/textarea.tsx` | ✅ In Use | ✅ Yes | None | Forms, comments |
| **Table** | `ui/table.tsx` | ✅ In Use | Partial | None | Data display (users, leaves, logs) |
| **Tabs** | `ui/tabs.tsx` | ✅ In Use | Partial | Radix Tabs | Navigation, content switching |
| **Popover** | `ui/popover.tsx` | ✅ In Use | Partial | Radix Popover | Date pickers, dropdowns |
| **Calendar** | `ui/calendar.tsx` | ✅ In Use | No | React Day Picker | Date selection |
| **Avatar** | `ui/avatar.tsx` | ✅ In Use | No | Radix Avatar | User profiles |
| **Badge** | `ui/badge.tsx` | ✅ In Use | No | CVA | Status indicators |
| **Alert** | `ui/alert.tsx` | ✅ In Use | Partial | None | Notifications, warnings |
| **Alert Dialog** | `ui/alert-dialog.tsx` | ✅ In Use | Partial | Radix Alert Dialog | Confirmations, destructive actions |
| **Dropdown Menu** | `ui/dropdown-menu.tsx` | ✅ In Use | Partial | Radix Dropdown | Context menus, actions |
| **Progress** | `ui/progress.tsx` | ✅ In Use | No | Radix Progress | Upload progress, loading |
| **Radio Group** | `ui/radio-group.tsx` | ✅ In Use | No | Radix Radio | Forms, options |
| **Scroll Area** | `ui/scroll-area.tsx` | ✅ In Use | No | Radix Scroll Area | Scrollable content |
| **Separator** | `ui/separator.tsx` | ✅ In Use | No | Radix Separator | Visual dividers |
| **Switch** | `ui/switch.tsx` | ✅ In Use | No | Radix Switch | Toggles, settings |
| **Accordion** | `ui/accordion.tsx` | ✅ In Use | Partial | Radix Accordion | Expandable sections |
| **Command** | `ui/command.tsx` | ✅ In Use | Partial | cmdk | Command palette, search |
| **Date Range Picker** | `ui/date-range-picker.tsx` | ✅ In Use | No | React Day Picker | Date range selection |
| **Form** | `ui/form.tsx` | ✅ In Use | No | React Hook Form | Form context |
| **Sonner (Toast)** | `ui/sonner.tsx` | ✅ In Use | Partial | Sonner | Notifications |

**Enhancement Opportunities:**
- Add glassmorphism to Dialog, Popover, Dropdown backgrounds
- Enhance Table with glass headers and alternating row transparency
- Add blur effects to Alert and Badge components
- Implement glass overlay for Command palette

### 4.2 Custom Page Components

| Page | File Path | Purpose | Components Used | Supabase Calls |
|------|-----------|---------|-----------------|----------------|
| **Dashboard** | `app/dashboard/page.tsx` | Main dashboard | Card, Button | getUser |
| **Login** | `app/login/page.tsx` | Authentication | LoginForm | N/A (wrapper) |
| **Leaves List** | `app/dashboard/leaves/page.tsx` | View leave requests | LeaveRequestList, Table | leaves query |
| **New Leave** | `app/dashboard/leaves/new/page.tsx` | Create leave request | LeaveRequestForm | leave types query |
| **Leave Detail** | `app/dashboard/leaves/[id]/page.tsx` | View/edit leave | LeaveRequestDetail | single leave query |
| **Leave Edit** | `app/dashboard/leaves/[id]/edit/page.tsx` | Edit leave request | LeaveRequestForm | single leave query |
| **Documents** | `app/dashboard/documents/page.tsx` | Document management | DocumentList, DocumentUpload | documents query, storage |
| **Calendar** | `app/dashboard/calendar/page.tsx` | Team calendar view | TeamCalendar, CalendarEventForm | calendar events query |
| **Approvals** | `app/dashboard/approvals/page.tsx` | Leave approvals | LeaveRequestList, Dialog | leaves query (filtered) |
| **Reports** | `app/dashboard/reports/page.tsx` | Reporting dashboard | ReportingDashboard, Charts | reports query |
| **Admin Dashboard** | `app/dashboard/admin/page.tsx` | Admin overview | AdminDashboard, Cards | multiple queries |
| **User Management** | `app/dashboard/admin/users/page.tsx` | Manage users | UserManagement, Table | employees query |
| **Role Management** | `app/dashboard/admin/roles/page.tsx` | Manage roles | RoleManagement, Form | roles query |
| **Audit Logs** | `app/dashboard/admin/audit-logs/page.tsx` | View audit trail | AuditLogViewer, Table | audit_logs query |
| **Admin Reports** | `app/dashboard/admin/reports/page.tsx` | Admin reporting | ReportingDashboard | reports query |
| **Diagnostics** | `app/dashboard/diagnostics/page.tsx` | System diagnostics | DiagnosticsPanel | diagnostic queries |
| **Auth - Login** | `app/auth/login/page.tsx` | Login page | LoginForm | signInWithPassword |
| **Auth - Register** | `app/auth/register/page.tsx` | Registration | RegisterForm | signUp |
| **Auth - Reset Password** | `app/auth/reset-password/page.tsx` | Password reset | PasswordResetForm | resetPasswordForEmail |
| **Auth - Update Password** | `app/auth/update-password/page.tsx` | Update password | UpdatePasswordForm | updateUser |
| **Auth - Verify Email** | `app/auth/verify-email/page.tsx` | Email verification | VerificationMessage | verifyOtp |
| **Auth - Error** | `app/auth/auth-code-error/page.tsx` | Auth error handler | ErrorDisplay | N/A |

### 4.3 Custom Feature Components

| Component | File Path | Purpose | Shadcn Components | Supabase Integration |
|-----------|-----------|---------|------------------|---------------------|
| **LoginForm** | `auth/login-form.tsx` | Login UI | Button, Input, Label, Card, Checkbox | signInWithPassword |
| **RegisterForm** | `auth/register-form.tsx` | Registration UI | Button, Input, Label, Card | signUp |
| **PasswordResetForm** | `auth/password-reset-form.tsx` | Password reset | Button, Input, Card | resetPasswordForEmail |
| **UpdatePasswordForm** | `auth/update-password-form.tsx` | Update password | Button, Input, Card | updateUser |
| **ProtectedRoute** | `auth/protected-route.tsx` | Route guard | None | getUser |
| **PermissionGate** | `auth/permission-gate.tsx` | Permission check | None | getUser, permissions |
| **AuthProvider** | `auth/auth-provider.tsx` | Auth context | None | auth.onAuthStateChange |
| **UserNav** | `auth/user-nav.tsx` | User navigation | Avatar, Dropdown | getUser |
| **LeaveRequestForm** | `leave/leave-request-form.tsx` | Create/edit leave | Card, Form, Select, Calendar, Textarea, Button | leaves insert/update |
| **LeaveRequestList** | `leave/leave-request-list.tsx` | List leaves | Table, Badge, Dropdown | leaves query |
| **LeaveRequestDetail** | `leave/leave-request-detail.tsx` | View leave details | Card, Badge, Button, Dialog | single leave query |
| **LeaveApprovalWorkflow** | `leave-request/leave-approval-workflow.tsx` | Approve/reject | Dialog, Textarea, Button | leaves update |
| **LeaveBalanceWidget** | `leave-balance/leave-balance-widget.tsx` | Show balance | Card, Progress | leave_balances query |
| **DocumentUpload** | `documents/document-upload.tsx` | Upload files | Dialog, Button, Input | storage.upload |
| **DocumentList** | `documents/document-list.tsx` | List documents | Table, Badge, Dropdown | documents query |
| **DocumentCategorization** | `documents/document-categorization.tsx` | Categorize docs | Select, Dialog | categories query |
| **DocumentExportDialog** | `documents/document-export-dialog.tsx` | Export documents | Dialog, Select, Button | RPC/export function |
| **TeamCalendar** | `calendar/team-calendar.tsx` | Calendar view | Card, Badge, Calendar UI | calendar_events query |
| **CalendarEventForm** | `calendar/calendar-event-form.tsx` | Create/edit event | Dialog, Form, Select, Calendar, Input | calendar_events insert/update |
| **NotificationBell** | `notifications/notification-bell.tsx` | Notification icon | Popover, Badge | notifications query |
| **NotificationCenter** | `notifications/notification-center.tsx` | Notification list | Dialog, Card, Button | notifications query |
| **UserManagement** | `admin/user-management.tsx` | Manage users | Table, Dialog, Form, Select, Dropdown | employees CRUD |
| **RoleManagement** | `admin/role-management.tsx` | Manage roles | Table, Dialog, Form, Checkbox | roles CRUD |
| **AuditLogViewer** | `admin/audit-log-viewer.tsx` | View logs | Table, Badge, Tabs | audit_logs query |
| **HolidayManagement** | `admin/holiday-management.tsx` | Manage holidays | Table, Dialog, Form, Calendar | holidays CRUD |
| **AdminDashboard** | `admin/admin-dashboard.tsx` | Admin overview | Card, Table, Badge | multiple queries |
| **ReportingDashboard** | `reports/reporting-dashboard.tsx` | Reports view | Card, Select, Tabs | reports query |
| **BarChart** | `reports/bar-chart.tsx` | Bar chart | Recharts | N/A (receives data) |
| **LineChart** | `reports/line-chart.tsx` | Line chart | Recharts | N/A (receives data) |
| **PieChart** | `reports/pie-chart.tsx` | Pie chart | Recharts | N/A (receives data) |
| **ReportExportDialog** | `reports/report-export-dialog.tsx` | Export reports | Dialog, Select, Button | RPC/export function |
| **Header** | `layout/header.tsx` | Page header | Nav, UserNav, ModeToggle | N/A |
| **MainNav** | `layout/main-nav.tsx` | Main navigation | Nav links, Icons | N/A |
| **SiteFooter** | `layout/site-footer.tsx` | Footer | Links, Text | N/A |
| **ThemeProvider** | `theme-provider.tsx` | Theme context | next-themes | N/A |
| **ModeToggle** | `mode-toggle.tsx` | Dark/light toggle | Button, Dropdown | N/A |
| **AppProviders** | `providers/app-providers.tsx` | Provider wrapper | React Query, Theme | N/A |

---

## 5. Frontend-Backend Connection Report

### 5.1 API Route Summary

**Total API Routes:** 28

| Route | Method(s) | Purpose | Supabase Table(s) | RLS Applied | Frontend Consumer |
|-------|-----------|---------|-------------------|-------------|-------------------|
| `/api/auth/callback` | GET | OAuth callback handler | auth.users | Yes | Auth flow |
| `/api/departments` | GET | Fetch departments | departments | Yes | Filters, forms |
| `/api/leave-types` | GET | Fetch leave types | leave_types | Yes | Leave form |
| `/api/leaves` | GET, POST | CRUD leave requests | leaves | Yes | Leave list, form |
| `/api/leaves/[id]` | GET, PATCH, DELETE | Single leave operations | leaves | Yes | Leave detail, edit |
| `/api/leave-requests/approval` | POST | Approve/reject leave | leaves | Yes | Approval workflow |
| `/api/calendar` | GET | Fetch calendar events | calendar_events | Yes | Calendar page |
| `/api/calendar/events` | GET, POST | CRUD calendar events | calendar_events | Yes | Calendar event form |
| `/api/calendar/events/[id]` | GET, PATCH, DELETE | Single event operations | calendar_events | Yes | Event detail |
| `/api/documents` | GET, POST | CRUD documents | documents | Yes | Document list, upload |
| `/api/documents/[id]` | GET, PATCH, DELETE | Single document operations | documents | Yes | Document detail |
| `/api/documents/upload` | POST | Upload document file | documents, storage | Yes | Document upload |
| `/api/documents/search` | GET | Search documents | documents | Yes | Document search |
| `/api/documents/categories` | GET | Fetch doc categories | document_categories | Yes | Categorization |
| `/api/documents/export` | POST | Export documents | documents | Yes | Export dialog |
| `/api/storage/documents` | GET, POST | Storage bucket operations | storage | Yes | Document management |
| `/api/reports/leave-by-type` | GET | Leave type report | leaves, leave_types | Yes | Reports dashboard |
| `/api/reports/leave-by-department` | GET | Department report | leaves, employees | Yes | Reports dashboard |
| `/api/reports/leave-stats` | GET | Leave statistics | leaves | Yes | Dashboard stats |
| `/api/reports/monthly-trends` | GET | Monthly trends report | leaves | Yes | Reports charts |
| `/api/reports/export` | POST | Export reports | reports | Yes | Export dialog |
| `/api/notifications` | GET | Fetch notifications | notifications | Yes | Notification bell |
| `/api/notifications/[id]/read` | PATCH | Mark notification read | notifications | Yes | Notification center |
| `/api/notifications/mark-all-read` | POST | Mark all read | notifications | Yes | Notification center |
| `/api/notify` | POST | Send notification | notifications | Yes | Internal notifications |
| `/api/outlook/auth` | GET | Outlook OAuth | user_integrations | Yes | Outlook integration |
| `/api/outlook/calendar` | GET | Fetch Outlook events | user_integrations | Yes | Calendar sync |
| `/api/diagnostics` | GET | System diagnostics | Multiple | Yes | Diagnostics page |

### 5.2 Data Flow Patterns

#### Pattern 1: Standard CRUD Flow
```
Frontend Component → API Route → Supabase Client → Database (with RLS) → Response → Component Update
```

**Example: Leave Request Creation**
```
LeaveRequestForm.tsx
  ↓ (POST /api/leaves)
frontend/src/app/api/leaves/route.ts
  ↓ (supabase.from('leaves').insert())
Supabase PostgreSQL (leaves table)
  ↓ (RLS policy: leaves_requester_insert)
Response { data: Leave }
  ↓ (toast.success, router.push)
LeaveRequestList.tsx (updated)
```

#### Pattern 2: Authentication Flow
```
LoginForm
  ↓ (supabase.auth.signInWithPassword)
Supabase Auth Service
  ↓ (session created)
AuthProvider (context update)
  ↓ (redirect)
Dashboard (protected route)
```

#### Pattern 3: File Upload Flow
```
DocumentUpload
  ↓ (POST /api/documents/upload)
API Route (validates file)
  ↓ (supabase.storage.upload)
Supabase Storage (corporate.documents bucket)
  ↓ (storage_path returned)
Database Insert (documents table)
  ↓ (response with signed URL)
DocumentList (updated with new document)
```

#### Pattern 4: Real-time Subscription Flow
```
Component (useEffect)
  ↓ (supabase.channel().on('postgres_changes'))
Supabase Realtime
  ↓ (change event)
Component State Update
  ↓ (re-render with new data)
```

### 5.3 Supabase Client Usage Patterns

**Client-Side (Browser):**
```typescript
// frontend/src/lib/supabase/client.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export function createClient() {
  return createPagesBrowserClient()
}

export const supabase = createClient() // Singleton
```

**Usage in Components:**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('leaves')
  .select('*')
  .eq('requester_id', user.id)
```

**Server-Side (API Routes, Server Components):**
```typescript
// frontend/src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createClient() {
  return createServerComponentClient({ cookies })
}
```

**Usage in API Routes:**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query with RLS automatically applied
  const { data, error } = await supabase.from('leaves').select('*')

  return NextResponse.json({ data })
}
```

---

## 6. Supabase Integration Summary

### 6.1 Authentication

**Current Implementation:**
- **Provider:** Supabase Auth
- **Method:** Email/Password
- **Session Management:** Cookie-based with auto-refresh
- **Components:**
  - `AuthProvider` - Manages auth state
  - `ProtectedRoute` - Route guard wrapper
  - `PermissionGate` - Role-based access control

**Auth Flow:**
```
1. User enters credentials
2. LoginForm calls supabase.auth.signInWithPassword()
3. Session cookie set by Supabase
4. AuthProvider updates context
5. Middleware checks session on protected routes
6. Redirect to dashboard if authenticated
```

**Auth API:**
```typescript
// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign Out
await supabase.auth.signOut()

// Get Current User
const { data: { user } } = await supabase.auth.getUser()

// Password Reset
await supabase.auth.resetPasswordForEmail(email)
```

### 6.2 Database Tables & RLS Policies

**Core Tables:**

| Table | Columns | RLS Policies | Purpose |
|-------|---------|--------------|---------|
| **employees** | id, supabase_id, email, first_name, last_name, role, department, photo_url, is_active, created_at, updated_at | `employees_requester_select`, `employees_department_select`, `employees_admin_select` | User profiles |
| **leave_types** | id, name, description, default_allocation_days, is_active, created_at, updated_at | Public read | Leave categories |
| **leave_balances** | id, employee_id, leave_type_id, total_days, used_days, year, created_at, updated_at | `leave_balances_requester_select`, `leave_balances_admin_select` | Leave allocations |
| **leaves** | id, requester_id, leave_type_id, start_date, end_date, days_count, status, reason, reviewer_comment, approver_id, approved_at, created_at, updated_at | `leaves_requester_select`, `leaves_requester_insert`, `leaves_approver_select`, `leaves_department_select`, `leaves_admin_select` | Leave requests |
| **departments** | id, name, description, created_at, updated_at | Public read | Organizational units |
| **calendar_events** | id, employee_id, title, description, start_date, end_date, event_type, leave_request_id, is_all_day, color, location, created_by, created_at, updated_at | `calendar_events_owner_select`, `calendar_events_department_select`, `calendar_events_admin_select` | Calendar entries |
| **documents** | id, employee_id, category_id, title, description, file_name, file_size, file_type, file_path, storage_path, is_private, expires_at, uploaded_by, uploaded_at, updated_at, is_deleted, deleted_at | `documents_owner_select`, `documents_shared_select`, `documents_admin_select` | Document metadata |
| **document_categories** | id, name, description, parent_category_id, is_active, created_at, updated_at | Public read | Document organization |
| **document_shares** | id, document_id, shared_by, shared_with, permission_level, expires_at, is_active, created_at, updated_at | `document_shares_owner_select`, `document_shares_recipient_select` | Document sharing |
| **document_audit_logs** | id, document_id, employee_id, action, ip_address, user_agent, created_at | `document_audit_logs_admin_select` | Document activity tracking |
| **report_templates** | id, name, description, report_type, query_template, parameters_schema, output_format, is_public, is_active, created_by, created_at, updated_at | Public read for is_public=true | Report definitions |
| **report_executions** | id, template_id, executed_by, parameters, status, result_data, result_file_path, error_message, execution_time_ms, created_at, started_at, completed_at | `report_executions_owner_select`, `report_executions_admin_select` | Report runs |
| **notifications** | id, employee_id, type, title, message, read, created_at | `notifications_owner_select` | User notifications |
| **audit_logs** | id, user_id, action, table_name, record_id, old_values, new_values, metadata, created_at | `audit_logs_admin_select` | System audit trail |

**RLS Policy Patterns:**

```sql
-- Example: Employee can view own records
CREATE POLICY "employees_requester_select"
ON employees FOR SELECT
USING (supabase_id = auth.uid());

-- Example: Admin can view all records
CREATE POLICY "employees_admin_select"
ON employees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE supabase_id = auth.uid()
    AND role IN ('admin', 'hr')
  )
);

-- Example: Manager can view department records
CREATE POLICY "employees_department_select"
ON employees FOR SELECT
USING (
  department = (
    SELECT department FROM employees
    WHERE supabase_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM employees
    WHERE supabase_id = auth.uid()
    AND role = 'manager'
  )
);
```

**Helper Functions:**
```sql
-- Get current user role
CREATE FUNCTION get_user_role() RETURNS text AS $$
  SELECT role FROM employees WHERE supabase_id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Get current user department
CREATE FUNCTION get_current_user_department() RETURNS text AS $$
  SELECT department FROM employees WHERE supabase_id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Check overlapping leaves
CREATE FUNCTION check_overlapping_leaves(
  employee_uuid uuid,
  check_start date,
  check_end date,
  exclude_leave_id uuid
) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM leaves
    WHERE requester_id = employee_uuid
    AND status != 'rejected'
    AND status != 'cancelled'
    AND (id IS DISTINCT FROM exclude_leave_id)
    AND (
      (start_date, end_date) OVERLAPS (check_start, check_end)
    )
  );
$$ LANGUAGE sql;

-- Get available leave days
CREATE FUNCTION get_available_leave_days(
  employee_uuid uuid,
  leave_type_uuid uuid,
  check_year integer
) RETURNS integer AS $$
  SELECT COALESCE(
    (SELECT total_days - used_days
     FROM leave_balances
     WHERE employee_id = employee_uuid
     AND leave_type_id = leave_type_uuid
     AND year = check_year),
    0
  );
$$ LANGUAGE sql;
```

### 6.3 Storage Configuration

**Buckets:**

| Bucket Name | Access | Purpose | Allowed MIME Types | Max File Size |
|-------------|--------|---------|-------------------|---------------|
| **public.documents** | Public with RLS | General documents, profile pictures | PDF, DOCX, XLSX, PPTX, images | 50MB |
| **corporate.documents** | Private (admin/hr only) | Company/employee docs with expiration | PDF, DOCX, XLSX, images | 50MB |

**Storage Patterns:**

**Upload Flow:**
```typescript
// 1. Upload file to storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('corporate.documents')
  .upload(`${employee_id}/${file.name}`, file)

// 2. Insert metadata into documents table
const { data: docData, error: docError } = await supabase
  .from('documents')
  .insert({
    employee_id,
    category_id,
    title,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    storage_path: uploadData.path,
    is_private: true,
    expires_at
  })
```

**Download Flow (Signed URLs):**
```typescript
// For private buckets, generate signed URL
const { data: urlData } = await supabase.storage
  .from('corporate.documents')
  .createSignedUrl(storage_path, 3600) // 1 hour expiry

// Use signed URL in component
<a href={urlData.signedUrl} download>
  Download Document
</a>
```

**RLS Policies for Storage:**
```sql
-- corporate.documents: Only admin/hr can upload
CREATE POLICY "corporate_documents_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'corporate.documents'
  AND (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'hr')
);

-- corporate.documents: Only authorized users can download
CREATE POLICY "corporate_documents_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'corporate.documents'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'hr'
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);
```

### 6.4 Real-time Subscriptions (Not Currently Implemented)

**Potential Implementation:**
```typescript
// Subscribe to leave request changes
useEffect(() => {
  const channel = supabase
    .channel('leaves-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaves',
        filter: `requester_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Leave change received:', payload)
        // Update local state
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user.id])
```

---

## 7. UI/UX Refactor Strategy

### 7.1 Current Glassmorphism Implementation

**Existing CSS (globals.css):**
```css
/* Global app background with gradient */
body {
  background: linear-gradient(135deg, var(--app-grad-1), var(--app-grad-2), var(--app-grad-3));
  background-attachment: fixed;
  min-height: 100vh;
}

/* Modern Card Design */
.modern-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 1.5rem;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Glass Input */
.glass-input {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
}

/* Glassmorphism Card Helper */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow-2), var(--card-shadow-1);
  border-radius: 18px;
}
```

**Current CSS Variables:**
```css
:root {
  /* Core palette */
  --background: #f7fbff;
  --foreground: #0f172a;
  --card-bg: rgba(255, 255, 255, 0.55);
  --card-border: rgba(255, 255, 255, 0.6);
  --card-shadow-1: 0 12px 24px rgba(16, 24, 40, 0.12);
  --card-shadow-2: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --glass-blur: 16px;
  --glass-saturate: 180%;

  /* Gradient stops for app background */
  --app-grad-1: #b9e6ff;
  --app-grad-2: #93c5fd;
  --app-grad-3: #60a5fa;

  /* Gradient stops for login background */
  --login-grad-1: #b9e6ff;
  --login-grad-2: #93c5fd;
  --login-grad-3: #60a5fa;
}

.dark {
  --background: #0c1016;
  --foreground: #e6e6e6;
  --card-bg: rgba(17, 25, 40, 0.75);
  --card-border: rgba(255, 255, 255, 0.125);
  --card-shadow-1: 0 12px 24px rgba(0, 0, 0, 0.35);
  --card-shadow-2: inset 0 1px 0 rgba(255, 255, 255, 0.08);

  /* Gradient stops for app background */
  --app-grad-1: #0b1b2b;
  --app-grad-2: #0c0f13;
  --app-grad-3: #12151a;

  /* Gradient stops for login background */
  --login-grad-1: #0b1b2b;
  --login-grad-2: #0c0f13;
  --login-grad-3: #12151a;
}
```

### 7.2 Enhancement Recommendations

#### 7.2.1 Consistent Glass Effects Across All Components

**Problem:** Not all components use glass effects consistently.

**Solution:**

1. **Add Glass Variants to Components:**
```typescript
// Example: Button with glass variant
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        glass: "glass-card hover:bg-opacity-60 transition-all",
        // ... other variants
      }
    }
  }
)
```

2. **Standardize Dialog/Modal Backgrounds:**
```css
/* Add to globals.css */
.dialog-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
}

.dialog-content {
  background: var(--card-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow-1);
}
```

3. **Glass Tables:**
```css
.table-glass {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  overflow: hidden;
}

.table-glass thead {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.dark .table-glass thead {
  background: rgba(0, 0, 0, 0.2);
}

.table-glass tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.05);
}
```

#### 7.2.2 Enhanced Gradient Patterns

**Current Gradients:**
- Light: Blue gradient (#b9e6ff → #93c5fd → #60a5fa)
- Dark: Dark blue gradient (#0b1b2b → #0c0f13 → #12151a)

**Enhancement: Add More Gradient Options:**

```css
:root {
  /* Primary gradient (existing) */
  --gradient-primary-start: #b9e6ff;
  --gradient-primary-mid: #93c5fd;
  --gradient-primary-end: #60a5fa;

  /* Accent gradient for cards */
  --gradient-accent-start: #60a5fa;
  --gradient-accent-end: #3b82f6;

  /* Success gradient */
  --gradient-success-start: #86efac;
  --gradient-success-end: #22c55e;

  /* Warning gradient */
  --gradient-warning-start: #fde047;
  --gradient-warning-end: #eab308;

  /* Danger gradient */
  --gradient-danger-start: #fca5a5;
  --gradient-danger-end: #ef4444;
}

.dark {
  --gradient-primary-start: #1e3a8a;
  --gradient-primary-mid: #1e40af;
  --gradient-primary-end: #2563eb;

  --gradient-accent-start: #3b82f6;
  --gradient-accent-end: #2563eb;

  --gradient-success-start: #166534;
  --gradient-success-end: #22c55e;

  --gradient-warning-start: #854d0e;
  --gradient-warning-end: #eab308;

  --gradient-danger-start: #991b1b;
  --gradient-danger-end: #ef4444;
}

/* Usage classes */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--gradient-primary-start), var(--gradient-primary-mid), var(--gradient-primary-end));
}

.bg-gradient-accent {
  background: linear-gradient(90deg, var(--gradient-accent-start), var(--gradient-accent-end));
}

.bg-gradient-success {
  background: linear-gradient(90deg, var(--gradient-success-start), var(--gradient-success-end));
}

.bg-gradient-warning {
  background: linear-gradient(90deg, var(--gradient-warning-start), var(--gradient-warning-end));
}

.bg-gradient-danger {
  background: linear-gradient(90deg, var(--gradient-danger-start), var(--gradient-danger-end));
}

/* Text gradients */
.text-gradient-primary {
  background: linear-gradient(90deg, var(--gradient-primary-start), var(--gradient-primary-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

#### 7.2.3 Micro-interactions & Animations

**Add Subtle Animations:**

```css
/* Hover lift effect for cards */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
}

/* Pulse effect for notifications */
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.notification-pulse::before {
  content: '';
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: var(--gradient-danger-end);
  border-radius: 50%;
  animation: pulse-ring 1.5s ease-out infinite;
}
```

#### 7.2.4 Improved Status Indicators

**Current:** Basic colored badges.

**Enhanced:**

```tsx
// Example: Enhanced status badge with gradient
export function StatusBadge({ status }: { status: LeaveStatus }) {
  const styles = {
    pending: "bg-gradient-warning text-white",
    approved: "bg-gradient-success text-white",
    rejected: "bg-gradient-danger text-white",
    cancelled: "bg-muted text-muted-foreground"
  }

  return (
    <Badge className={cn(
      "glass-card px-3 py-1",
      styles[status]
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
```

#### 7.2.5 Responsive Glassmorphism

**Problem:** Glass effects may be too heavy on mobile.

**Solution:**

```css
/* Reduce blur on mobile for performance */
@media (max-width: 640px) {
  :root {
    --glass-blur: 8px;
  }

  .modern-card {
    backdrop-filter: blur(12px);
  }

  .glass-card {
    backdrop-filter: blur(8px) saturate(var(--glass-saturate));
  }
}

/* Disable blur on low-end devices (optional) */
@media (prefers-reduced-motion: reduce) {
  .modern-card,
  .glass-card,
  .glass-input {
    backdrop-filter: none;
    background: var(--card);
  }
}
```

### 7.3 Component-Specific Enhancements

| Component | Current State | Enhancement | Implementation |
|-----------|---------------|-------------|----------------|
| **Button** | Standard Shadcn | Add glass variant | `variant="glass"` with `.glass-card` |
| **Card** | Glass effect applied | Add hover animation | `.card-hover` class |
| **Dialog** | Basic background | Glass overlay + content | Update `Dialog` component with glass classes |
| **Table** | Standard styling | Glass header + rows | `.table-glass` wrapper class |
| **Dropdown** | Standard | Glass background | Update `DropdownMenu` content styles |
| **Popover** | Standard | Glass background | Update `Popover` content styles |
| **Select** | Standard | Glass dropdown | Update `SelectContent` styles |
| **Command** | Basic styling | Full glass treatment | Update `Command` container and items |
| **Toast** | Basic Sonner | Glass notifications | Custom `Toaster` styles |
| **Badge** | Solid colors | Gradient badges | Add gradient variants |
| **Avatar** | Standard | Glass border | Add glass border effect |
| **Progress** | Standard | Glass track | Update progress bar styles |

---

## 8. Dual-Theme Style Guide

### 8.1 Light Mode Color Palette

#### Primary Colors
| Variable | Hex | RGB | HSL | Usage |
|----------|-----|-----|-----|-------|
| `--background` | `#f7fbff` | `247, 251, 255` | `210, 100%, 99%` | Page background |
| `--foreground` | `#0f172a` | `15, 23, 42` | `218, 47%, 11%` | Primary text |
| `--primary` | `#3b82f6` | `59, 130, 246` | `217, 91%, 60%` | Primary actions |
| `--primary-foreground` | `#ffffff` | `255, 255, 255` | `0, 0%, 100%` | Text on primary |
| `--secondary` | `#64748b` | `100, 116, 139` | `215, 16%, 47%` | Secondary actions |
| `--secondary-foreground` | `#ffffff` | `255, 255, 255` | `0, 0%, 100%` | Text on secondary |
| `--accent` | `#60a5fa` | `96, 165, 250` | `214, 93%, 68%` | Accents, highlights |
| `--accent-foreground` | `#0f172a` | `15, 23, 42` | `218, 47%, 11%` | Text on accent |
| `--muted` | `#f1f5f9` | `241, 245, 249` | `210, 40%, 96%` | Muted backgrounds |
| `--muted-foreground` | `#64748b` | `100, 116, 139` | `215, 16%, 47%` | Muted text |

#### Status Colors
| Variable | Hex | RGB | HSL | Usage |
|----------|-----|-----|-----|-------|
| `--destructive` | `#ef4444` | `239, 68, 68` | `0, 84%, 60%` | Errors, delete actions |
| `--destructive-foreground` | `#ffffff` | `255, 255, 255` | `0, 0%, 100%` | Text on destructive |
| `--success` | `#22c55e` | `34, 197, 94` | `142, 71%, 45%` | Success states |
| `--warning` | `#eab308` | `234, 179, 8` | `45, 93%, 47%` | Warning states |
| `--info` | `#3b82f6` | `59, 130, 246` | `217, 91%, 60%` | Info messages |

#### Glass Effects
| Variable | Value | Purpose |
|----------|-------|---------|
| `--card-bg` | `rgba(255, 255, 255, 0.55)` | Glass card background |
| `--card-border` | `rgba(255, 255, 255, 0.6)` | Glass card border |
| `--card-shadow-1` | `0 12px 24px rgba(16, 24, 40, 0.12)` | Primary shadow |
| `--card-shadow-2` | `inset 0 1px 0 rgba(255, 255, 255, 0.6)` | Inner glow |
| `--glass-blur` | `16px` | Blur intensity |
| `--glass-saturate` | `180%` | Color saturation |

#### Gradients
| Variable | Start | Mid | End | Usage |
|----------|-------|-----|-----|-------|
| **App Background** | `#b9e6ff` | `#93c5fd` | `#60a5fa` | Body gradient |
| **Login Background** | `#b9e6ff` | `#93c5fd` | `#60a5fa` | Login page |
| **Button Primary** | `#60a5fa` | - | `#2563eb` | Primary buttons |
| **Success** | `#86efac` | - | `#22c55e` | Success indicators |
| **Warning** | `#fde047` | - | `#eab308` | Warning indicators |
| **Danger** | `#fca5a5` | - | `#ef4444` | Error indicators |

### 8.2 Dark Mode Color Palette

#### Primary Colors
| Variable | Hex | RGB | HSL | Usage |
|----------|-----|-----|-----|-------|
| `--background` | `#0c1016` | `12, 16, 22` | `216, 29%, 7%` | Page background |
| `--foreground` | `#e6e6e6` | `230, 230, 230` | `0, 0%, 90%` | Primary text |
| `--primary` | `#3b82f6` | `59, 130, 246` | `217, 91%, 60%` | Primary actions |
| `--primary-foreground` | `#ffffff` | `255, 255, 255` | `0, 0%, 100%` | Text on primary |
| `--secondary` | `#475569` | `71, 85, 105` | `215, 19%, 35%` | Secondary actions |
| `--secondary-foreground` | `#e6e6e6` | `230, 230, 230` | `0, 0%, 90%` | Text on secondary |
| `--accent` | `#60a5fa` | `96, 165, 250` | `214, 93%, 68%` | Accents, highlights |
| `--accent-foreground` | `#0f172a` | `15, 23, 42` | `218, 47%, 11%` | Text on accent |
| `--muted` | `#1e293b` | `30, 41, 59` | `215, 33%, 17%` | Muted backgrounds |
| `--muted-foreground` | `#94a3b8` | `148, 163, 184` | `215, 20%, 65%` | Muted text |

#### Status Colors (Same as Light)
| Variable | Hex | RGB | HSL | Usage |
|----------|-----|-----|-----|-------|
| `--destructive` | `#ef4444` | `239, 68, 68` | `0, 84%, 60%` | Errors, delete actions |
| `--destructive-foreground` | `#ffffff` | `255, 255, 255` | `0, 0%, 100%` | Text on destructive |
| `--success` | `#22c55e` | `34, 197, 94` | `142, 71%, 45%` | Success states |
| `--warning` | `#eab308` | `234, 179, 8` | `45, 93%, 47%` | Warning states |
| `--info` | `#3b82f6` | `59, 130, 246` | `217, 91%, 60%` | Info messages |

#### Glass Effects
| Variable | Value | Purpose |
|----------|-------|---------|
| `--card-bg` | `rgba(17, 25, 40, 0.75)` | Glass card background |
| `--card-border` | `rgba(255, 255, 255, 0.125)` | Glass card border |
| `--card-shadow-1` | `0 12px 24px rgba(0, 0, 0, 0.35)` | Primary shadow |
| `--card-shadow-2` | `inset 0 1px 0 rgba(255, 255, 255, 0.08)` | Inner glow |
| `--glass-blur` | `16px` | Blur intensity |
| `--glass-saturate` | `180%` | Color saturation |

#### Gradients
| Variable | Start | Mid | End | Usage |
|----------|-------|-----|-----|-------|
| **App Background** | `#0b1b2b` | `#0c0f13` | `#12151a` | Body gradient |
| **Login Background** | `#0b1b2b` | `#0c0f13` | `#12151a` | Login page |
| **Button Primary** | `#3b82f6` | - | `#2563eb` | Primary buttons |
| **Success** | `#166534` | - | `#22c55e` | Success indicators |
| **Warning** | `#854d0e` | - | `#eab308` | Warning indicators |
| **Danger** | `#991b1b` | - | `#ef4444` | Error indicators |

### 8.3 Glassmorphism Rules

#### Blur Levels
| Context | Blur | Saturation | Opacity | Use Case |
|---------|------|------------|---------|----------|
| **Heavy Glass** | 20px | 180% | 40-55% | Cards, modals |
| **Medium Glass** | 16px | 180% | 60-75% | Inputs, dropdowns |
| **Light Glass** | 12px | 150% | 80-90% | Headers, footers |
| **Subtle Glass** | 8px | 120% | 90-95% | Table rows, list items |

#### Border Standards
| Component | Border | Shadow | Inner Glow |
|-----------|--------|--------|------------|
| **Cards** | `1px solid var(--card-border)` | `var(--card-shadow-1)` | `var(--card-shadow-2)` |
| **Inputs** | `1px solid rgba(255,255,255,0.3)` | None | None |
| **Dialogs** | `1px solid var(--card-border)` | `0 20px 50px rgba(0,0,0,0.3)` | `var(--card-shadow-2)` |
| **Dropdowns** | `1px solid var(--card-border)` | `0 10px 30px rgba(0,0,0,0.2)` | `var(--card-shadow-2)` |

#### Responsive Adjustments
| Breakpoint | Blur Reduction | Opacity Increase | Purpose |
|------------|----------------|------------------|---------|
| `sm` (640px) | -4px | +10% | Performance |
| `md` (768px) | -2px | +5% | Balance |
| `lg+` (1024px+) | Full | Full | Full effect |

### 8.4 Shadcn UI Theming

**Current Shadcn Configuration (components.json):**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Tailwind Config Integration:**
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 9. Migration Roadmap

### Phase 1: Documentation & Planning (COMPLETED)
✅ **This Document**
- Complete codebase audit
- Component inventory
- API mapping
- Supabase integration documentation
- Style guide definition

### Phase 2: Style Refinements (Week 1-2)

**Priority 1: Extend Glass Effects**
- [ ] Add glass variants to all Shadcn UI components
- [ ] Implement glass overlays for dialogs and modals
- [ ] Create glass table styles
- [ ] Add glass dropdown and popover backgrounds
- [ ] Test responsive glass effects on mobile

**Priority 2: Gradient Enhancements**
- [ ] Add accent, success, warning, and danger gradients
- [ ] Create text gradient utilities
- [ ] Apply gradients to status badges
- [ ] Implement gradient buttons for key actions
- [ ] Test contrast ratios for accessibility

**Priority 3: Animation & Micro-interactions**
- [ ] Add hover lift effects to cards
- [ ] Implement shimmer loading states
- [ ] Create pulse effect for notifications
- [ ] Add transition animations to all components
- [ ] Test animations with `prefers-reduced-motion`

### Phase 3: Component Enhancements (Week 3-4)

**Priority 1: Core Components**
- [ ] Enhance Button component with glass variant
- [ ] Update Card with hover animations
- [ ] Refactor Dialog with full glass treatment
- [ ] Update Table with glass headers and rows
- [ ] Enhance Select, Dropdown, Popover with glass backgrounds

**Priority 2: Status & Feedback**
- [ ] Create enhanced StatusBadge with gradients
- [ ] Update Toast notifications with glass styling
- [ ] Improve Progress component with glass track
- [ ] Add loading skeletons with shimmer effect
- [ ] Enhance Alert component with glass background

**Priority 3: Forms & Inputs**
- [ ] Standardize all input fields with glass effects
- [ ] Update form validation styling
- [ ] Enhance date pickers with glass calendar
- [ ] Improve file upload UI with glass dropzone
- [ ] Add inline error messages with glass containers

### Phase 4: Testing & Optimization (Week 5)

**Performance Testing:**
- [ ] Lighthouse audits (target: >90 on all metrics)
- [ ] Test glass effects on low-end devices
- [ ] Measure paint and layout performance
- [ ] Test with different network conditions
- [ ] Verify mobile responsiveness

**Accessibility Testing:**
- [ ] WCAG 2.1 AA compliance check
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation testing
- [ ] Color contrast verification (all text ≥4.5:1)
- [ ] Focus state visibility
- [ ] Test with browser zoom (up to 200%)

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

**User Testing:**
- [ ] Internal team testing
- [ ] HR department feedback
- [ ] Employee usability testing
- [ ] Gather feedback on glassmorphism effectiveness
- [ ] Iterate based on user feedback

### Phase 5: Documentation Updates (Week 6)

- [ ] Update component documentation
- [ ] Create style guide for developers
- [ ] Document glassmorphism patterns
- [ ] Update README with new features
- [ ] Create video tutorials for key workflows
- [ ] Document accessibility considerations

---

## 10. Testing Checklist

### 10.1 Visual Testing

#### Light Mode
- [ ] Dashboard displays correctly with gradient background
- [ ] Cards have glass effect with proper transparency
- [ ] Inputs have glass styling with visible borders
- [ ] Buttons have appropriate hover states
- [ ] Status badges use correct gradient colors
- [ ] Tables have glass headers and alternating rows
- [ ] Modals have glass overlay and content
- [ ] Dropdowns have glass background
- [ ] Calendar has proper glass styling
- [ ] Charts display correctly with glass containers

#### Dark Mode
- [ ] Dashboard displays with dark gradient background
- [ ] Glass effects use dark mode variables
- [ ] Text contrast is sufficient (≥4.5:1)
- [ ] All colors adapt to dark mode
- [ ] Status indicators are visible and clear
- [ ] Borders are visible but subtle
- [ ] Shadows provide appropriate depth
- [ ] All components maintain readability
- [ ] Theme toggle switches correctly
- [ ] Persists across page refreshes

#### Responsive Design
- [ ] Mobile layout (< 640px) works correctly
- [ ] Tablet layout (640px - 1024px) is usable
- [ ] Desktop layout (> 1024px) is optimal
- [ ] Glass effects scale appropriately
- [ ] Touch targets are ≥44x44px on mobile
- [ ] Navigation menu works on mobile
- [ ] Tables are scrollable horizontally on mobile
- [ ] Forms are single-column on mobile
- [ ] Calendar view adapts to screen size
- [ ] All text is readable at 320px width

### 10.2 Functional Testing

#### Authentication
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Registration creates new user
- [ ] Password reset email is sent
- [ ] Password update works correctly
- [ ] Email verification completes successfully
- [ ] Session persists across page reloads
- [ ] Sign out clears session and redirects
- [ ] Protected routes redirect to login
- [ ] Authenticated users can access dashboard

#### Leave Management
- [ ] Create leave request succeeds
- [ ] Edit leave request updates correctly
- [ ] Delete leave request removes it
- [ ] View leave request shows all details
- [ ] Filter leaves by status works
- [ ] Filter leaves by type works
- [ ] Filter leaves by date range works
- [ ] Approve leave request updates status
- [ ] Reject leave request with comment works
- [ ] Leave balance updates after approval

#### Document Management
- [ ] Upload document succeeds
- [ ] Download document works
- [ ] View document metadata shows details
- [ ] Delete document removes it
- [ ] Search documents finds results
- [ ] Filter by category works
- [ ] Export documents generates file
- [ ] Document expiry warnings show
- [ ] Signed URLs work for private documents
- [ ] RLS prevents unauthorized access

#### Calendar
- [ ] View calendar shows all events
- [ ] Create calendar event succeeds
- [ ] Edit calendar event updates correctly
- [ ] Delete calendar event removes it
- [ ] Filter by event type works
- [ ] Filter by department works
- [ ] Month/week/day views switch correctly
- [ ] Leave events sync with leave requests
- [ ] Outlook integration syncs events
- [ ] Calendar exports to .ics file

#### Admin Features
- [ ] User management CRUD operations work
- [ ] Role management CRUD operations work
- [ ] Audit log viewer displays events
- [ ] Reports generate correctly
- [ ] Export reports to CSV/Excel works
- [ ] Holiday management CRUD works
- [ ] Diagnostics page shows system status
- [ ] Admin dashboard shows statistics
- [ ] Permission checks prevent unauthorized access
- [ ] Bulk operations complete successfully

### 10.3 Performance Testing

#### Load Times
- [ ] Initial page load < 3s on 3G
- [ ] Initial page load < 1s on WiFi
- [ ] Subsequent page loads < 500ms (cached)
- [ ] API calls respond < 200ms (average)
- [ ] Large tables load < 2s
- [ ] Document uploads complete within expected time
- [ ] Report generation < 5s for standard reports
- [ ] Calendar view loads < 1s
- [ ] Search results appear < 500ms
- [ ] Notifications load < 300ms

#### Lighthouse Scores (Target)
- [ ] Performance: ≥90
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90
- [ ] PWA: N/A (not a PWA)

#### Bundle Size
- [ ] Initial JS bundle < 500KB
- [ ] Total page weight < 2MB
- [ ] Images are optimized and lazy loaded
- [ ] Fonts are subset and preloaded
- [ ] CSS is minified and critical CSS inlined
- [ ] Unused CSS is removed
- [ ] Code splitting is effective
- [ ] Dynamic imports reduce initial load

### 10.4 Accessibility Testing

#### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape key closes modals and dropdowns
- [ ] Arrow keys navigate lists and menus
- [ ] Enter/Space activate buttons and links
- [ ] No keyboard traps exist
- [ ] Skip navigation link is present
- [ ] Focus returns to trigger after modal close
- [ ] Custom keyboard shortcuts documented

#### Screen Reader Testing
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Buttons have descriptive text
- [ ] Links have descriptive text
- [ ] Dynamic content announces changes
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Loading states are announced
- [ ] Tables have proper headers
- [ ] ARIA landmarks are used correctly

#### Color & Contrast
- [ ] All text meets contrast ratios (≥4.5:1)
- [ ] Large text meets contrast ratios (≥3:1)
- [ ] UI components meet contrast ratios (≥3:1)
- [ ] Focus indicators meet contrast ratios (≥3:1)
- [ ] Information is not conveyed by color alone
- [ ] Gradients maintain sufficient contrast
- [ ] Glass effects don't reduce text contrast
- [ ] Dark mode maintains contrast ratios
- [ ] Status indicators are distinguishable
- [ ] Charts use patterns in addition to colors

### 10.5 Browser & Device Testing

#### Desktop Browsers
- [ ] Chrome (Windows)
- [ ] Chrome (macOS)
- [ ] Firefox (Windows)
- [ ] Firefox (macOS)
- [ ] Safari (macOS)
- [ ] Edge (Windows)
- [ ] Brave (Windows/macOS)

#### Mobile Browsers
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet (Android)
- [ ] Edge (iOS/Android)

#### Devices
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad, 1024x768)
- [ ] Mobile (iPhone 12, 390x844)
- [ ] Mobile (Samsung Galaxy, 360x740)
- [ ] Large screen (2560x1440)

### 10.6 Security Testing

#### Authentication & Authorization
- [ ] Passwords are hashed securely
- [ ] Sessions expire after inactivity
- [ ] CSRF protection is in place
- [ ] XSS prevention is effective
- [ ] SQL injection prevention works
- [ ] Rate limiting is enforced
- [ ] Failed login attempts are limited
- [ ] Password reset tokens expire
- [ ] Email verification is required
- [ ] RLS policies prevent unauthorized access

#### Data Protection
- [ ] Sensitive data is encrypted at rest
- [ ] Sensitive data is encrypted in transit (HTTPS)
- [ ] File uploads are validated
- [ ] File types are restricted
- [ ] File sizes are limited
- [ ] Signed URLs expire correctly
- [ ] Private documents require authentication
- [ ] API keys are not exposed
- [ ] Environment variables are secure
- [ ] No sensitive data in logs

---

## 11. Conclusion

This comprehensive report documents the current state of the Leave Management System and provides a detailed enhancement strategy for the existing Shadcn UI + Glassmorphism implementation.

### Key Takeaways

1. **Already Well-Implemented:** The project has a solid foundation with Shadcn UI components and glassmorphism effects already in place.

2. **Enhancement Focus:** Rather than a full migration, focus on refining and standardizing the existing glass effects across all components.

3. **Performance-First:** Ensure glass effects don't compromise performance, especially on mobile devices.

4. **Accessibility:** Maintain WCAG 2.1 AA compliance throughout all enhancements.

5. **User Experience:** Prioritize usability and clarity over visual effects.

### Next Steps

1. **Review this document** with the development team
2. **Prioritize enhancements** based on business value and user impact
3. **Create tickets** for each enhancement task
4. **Begin Phase 2** (Style Refinements) implementation
5. **Iterate based on user feedback** throughout the process

### Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Report Generated:** January 2025
**Version:** 1.0
**Last Updated:** 2025-01-17

---

## Appendix A: File Structure Reference

### Complete Frontend File Tree
```
frontend/src/
├── app/
│   ├── api/ (28 routes)
│   ├── auth/ (6 pages)
│   ├── dashboard/ (17 pages)
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/ (26 components)
│   ├── admin/ (5 components)
│   ├── auth/ (8 components)
│   ├── calendar/ (3 components)
│   ├── documents/ (4 components)
│   ├── layout/ (3 components)
│   ├── leave/ (3 components)
│   ├── leave-balance/ (1 component)
│   ├── leave-request/ (1 component)
│   ├── notifications/ (2 components)
│   ├── providers/ (1 component)
│   ├── reports/ (5 components)
│   └── ... (5 misc components)
├── hooks/ (2 hooks)
├── lib/
│   ├── auth/
│   ├── notifications/
│   ├── services/ (4 services)
│   ├── supabase/ (3 files)
│   ├── validations/ (4 files)
│   └── ... (3 utility files)
└── types/ (3 type files)
```

---

**End of Report**
