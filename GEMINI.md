# GEMINI Project: Leave Management System

## Project Overview

This project is a full-stack web application for managing employee leaves. It provides a role-based system for employees, managers, HR, and administrators to handle leave requests, approvals, and related documentation.

**Key Features:**

*   **Role-Based Access Control (RBAC):** Different user roles (employee, manager, HR, admin) have distinct permissions and views.
*   **Leave Request Workflow:** Employees can submit leave requests, which are then routed to managers for approval.
*   **Document Management:** Users can upload and manage documents related to their leave requests.
*   **Dashboards:** Role-specific dashboards provide an overview of leave balances, pending approvals, and other relevant information.
*   **Admin Panel:** Administrators can manage users, roles, and other system settings.

**Technologies:**

*   **Frontend:**
    *   **Framework:** Next.js 15 (App Router) with TypeScript
    *   **UI:** Tailwind CSS with shadcn/ui components
    *   **State Management:** React Query for data fetching and caching
    *   **Forms:** React Hook Form with Zod for validation
    *   **Testing:** Playwright for E2E tests and Vitest for unit tests
## Backend (Supabase)

This section provides a detailed overview of the Supabase backend, including the database schema, migrations, functions, and security policies.

### Database Schema

The database schema is designed to support the core features of the Leave Management System. The following are the main tables:

*   `employees`: Stores employee profiles and authentication information.
*   `leave_types`: Defines the different types of leave available in the system.
*   `leave_balances`: Tracks the leave balances for each employee.
*   `leaves`: Manages leave requests and their approval status.
*   `company_documents`: Stores company-wide documents.
*   `audit_logs`: Provides a system audit trail for compliance.
*   `calendar_events`: Stores calendar events, including leave, holidays, and meetings.
*   `document_categories`: Defines categories for documents.
*   `documents`: Manages user-uploaded documents.
*   `document_shares`: Manages sharing of documents.
*   `document_audit_logs`: Logs audit trails for document-related actions.
*   `report_templates`: Stores templates for generating reports.
*   `report_executions`: Logs the execution of reports.
*   `notification_preferences`: Manages user notification preferences.
*   `user_integrations`: Stores user-specific integration tokens and metadata.

### Migrations

The database schema is managed through a series of migration files located in the `supabase/migrations` directory. The following migrations have been applied:

*   `001_create_core_tables.sql`: Creates the initial set of tables for the application.
*   `002_create_rls_policies.sql`: Implements Row-Level Security (RLS) policies to control access to data.
*   `003_create_business_functions.sql`: Creates PostgreSQL functions to implement business logic.
*   `004_refine_rls_leaves.sql`: Refines the RLS policies for the `leaves` table.
*   `005_calendar_and_documents.sql`: Adds tables for calendar and document management.
*   `006_rls_calendar_documents_reporting.sql`: Adds RLS policies for the new calendar, document, and reporting tables.
*   `007_create_user_integrations_table.sql`: Adds a table for user integrations.
*   `010_fix_rls_documents_team_policy.sql`: Fixes a bug in the RLS policy for documents.
*   `011_fix_employees_rls_recursion.sql`: Fixes a recursion issue in the RLS policy for employees.

### Functions

The following PostgreSQL functions are defined in the database:

*   `calculate_business_days(start_date date, end_date date)`: Calculates the number of business days between two dates.
*   `get_available_leave_days(p_employee_id uuid, p_leave_type_id uuid, p_year integer)`: Returns the number of available leave days for an employee.
*   `check_overlapping_leaves(p_employee_id uuid, p_start_date date, p_end_date date, p_exclude_leave_id uuid)`: Checks for overlapping leave requests.
*   `update_leave_balance_on_approval()`: A trigger function that updates the leave balance when a leave request is approved.
*   `log_audit_event(p_action text, p_table_name text, p_record_id uuid, p_old_values jsonb, p_new_values jsonb, p_metadata jsonb)`: Logs an audit event.
*   `get_employee_leave_summary(p_employee_id uuid, p_year integer)`: Returns a summary of leave for an employee.
*   `get_department_leave_calendar(p_department text, p_start_date date, p_end_date date)`: Returns a leave calendar for a department.
*   `get_employee_id_by_supabase_uid(user_uuid uuid)`: Returns the employee ID for a given Supabase user ID.
*   `get_user_role()`: Returns the role of the current user.
*   `is_manager_of_department(department_name text)`: Checks if the current user is a manager of a given department.
*   `get_current_user_department()`: Returns the department of the current user.

### RLS Policies

Row-Level Security (RLS) is enabled on all tables to ensure that users can only access the data they are authorized to see. The policies are defined in the migration files and are based on the user's role and department.

### Registered Auth Users

The following users are registered in the system:

| Email                       | Role     | First Name | Last Name | Department      | Active |
| --------------------------- | -------- | ---------- | --------- | --------------- | ------ |
| test.employee@example.com   | employee | Test       | Employee  | Engineering     | true   |
| test.manager@example.com    | manager  | Test       | Manager   | Engineering     | true   |
| test.hr@example.com         | hr       | Test       | HR        | Human Resources | true   |
| test.admin@example.com      | admin    | Test       | Admin     | Administration  | true   |
*   **Deployment:**
    *   **Frontend:** Vercel
    *   **Backend:** Supabase
*   **CI/CD:** GitHub Actions

## Building and Running

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Install dependencies:**
    ```bash
    cd leave-management-system
    npm install
    cd frontend
    npm install
    ```
3.  **Set up environment variables:**
    *   Copy `frontend/env.example` to `frontend/.env.local` and fill in the required Supabase credentials.
4.  **Start the development servers:**
    *   **Frontend:**
        ```bash
        npm run dev
        ```
    *   **Backend (Supabase):**
        ```bash
        # Install the Supabase CLI if you haven't already
        npm install -g supabase
        supabase start
        ```

### Running Tests

*   **All tests:**
    ```bash
    npm test
    ```
*   **E2E tests:**
    ```bash
    npm run test:e2e
    ```

## Development Conventions

*   **Coding Style:** The project uses ESLint and Prettier to enforce a consistent coding style. A pre-commit hook is set up with Husky to automatically lint and format code before committing.
*   **Commit Messages:** Conventional Commits are suggested for commit messages.
*   **Branching:** Create a new branch from `main` for each new feature or bug fix.
*   **Pull Requests:** Submit a pull request to merge changes into `main`. Ensure that all CI checks pass before merging.
*   **Backend Changes:** When making changes to the backend (e.g., database schema, RLS policies), update the `docs/AUDIT.md` file with a description of the changes.
