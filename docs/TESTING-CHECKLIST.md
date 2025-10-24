# Comprehensive System Testing Checklist

Purpose: This checklist enumerates pages, UI elements, and expected behaviors across the system. Use it to conduct a comprehensive functionality test of every button and function.

How to use:
- Functional? column: mark ✔ if the feature works as intended, ✘ if it fails.
- Tested column: mark [x] once the item has been tested; leave [ ] if not yet tested.
- Add notes inline or in a separate test report for failures, edge cases, or screenshots.

Legend:
- Element Type examples: Button, Input, Select, Form, Link, Checkbox, Dialog, Table, Card, DatePicker.
- Label / Identifier is the visible label or a unique identifier/id if applicable.

---------------------------------------------------------------------------------------------
| Page Name                  | Element Type | Label / Identifier                 | Functional? | Purpose / Description                               | Tested |
|---------------------------|--------------|------------------------------------|-------------|-----------------------------------------------------|--------|
| Login Page                | Form         | Login Form                         |             | Captures email and password                         | [ ]    |
| Login Page                | Input        | Email (id="email")                |             | Enter user email                                    | [ ]    |
| Login Page                | Input        | Password (id="password")          |             | Enter user password                                 | [ ]    |
| Login Page                | Checkbox     | Remember me (id="remember")       |             | Persist session across visits                        | [ ]    |
| Login Page                | Link         | Forgot password?                   |             | Navigate to reset password page                      | [ ]    |
| Login Page                | Button       | Sign In                            |             | Submits login form (signInWithPassword)             | [ ]    |

| Register Page             | Form         | Registration Form                  |             | Captures new account details                         | [ ]    |
| Register Page             | Input        | First Name (id="firstName")       |             | Enter first name                                     | [ ]    |
| Register Page             | Input        | Last Name (id="lastName")         |             | Enter last name                                      | [ ]    |
| Register Page             | Input        | Email (id="email")                |             | Enter registration email                             | [ ]    |
| Register Page             | Input        | Password (id="password")          |             | Create password                                      | [ ]    |
| Register Page             | Input        | Confirm Password (id="confirmPassword") |        | Confirm password                                     | [ ]    |
| Register Page             | Button       | Create Account                     |             | Submits account creation (auth.signUp)               | [ ]    |

| Reset Password Page       | Form         | Reset Password Form                |             | Request password reset email                         | [ ]    |
| Reset Password Page       | Input        | Email (id="email")                |             | Enter account email to reset                         | [ ]    |
| Reset Password Page       | Button       | Send Reset Link                    |             | Sends reset email (auth.resetPasswordForEmail)       | [ ]    |
| Reset Password Page       | Button       | Send another email                 |             | Resets form and re-sends when submitted state shown  | [ ]    |

| Update Password Page      | Form         | Update Password Form               |             | Update password after reset                          | [ ]    |
| Update Password Page      | Input        | New Password (id="password")      |             | Enter new password                                   | [ ]    |
| Update Password Page      | Input        | Confirm New Password (id="confirmPassword") |    | Confirm new password                                 | [ ]    |
| Update Password Page      | Button       | Update Password                    |             | Submits password update (auth.updateUser)            | [ ]    |

| Dashboard (Main)          | Page         | Dashboard Overview                 |             | Loads user summary and navigation                    | [ ]    |
| Dashboard (Main)          | Nav          | Main Navigation Links              |             | Navigate to Calendar/Leaves/Documents/Reports/Admin  | [ ]    |
| Dashboard (Main)          | Button       | Refresh Data                       |             | Refreshes dashboard content                          | [ ]    |

| Dashboard → Leaves        | Page         | Leaves List                        |             | Shows user leave requests                            | [ ]    |
| Dashboard → Leaves        | Button       | New Leave Request                  |             | Opens Leave Request Form                             | [ ]    |
| Leave Request Form        | Select       | Leave Type                         |             | Choose leave type                                    | [ ]    |
| Leave Request Form        | DatePicker   | Start Date                         |             | Pick start date (no past/weekend dates)              | [ ]    |
| Leave Request Form        | DatePicker   | End Date                           |             | Pick end date (>= start date, no weekend)            | [ ]    |
| Leave Request Form        | Textarea     | Reason                             |             | Optional leave reason                                | [ ]    |
| Leave Request Form        | Button       | Submit Leave Request               |             | Create leave via /api/leaves                         | [ ]    |
| Leaves Detail             | Button       | Edit                               |             | Edit existing leave                                  | [ ]    |
| Leaves Detail             | Button       | Cancel                             |             | Cancel leave request                                 | [ ]    |

| Dashboard → Approvals     | Table        | Pending Approvals                  |             | Manager/HR approvals list                            | [ ]    |
| Approval Workflow         | Button       | Approve                            |             | Approve request with comment                         | [ ]    |
| Approval Workflow         | Button       | Reject                             |             | Reject request with comment                          | [ ]    |
| Approval Workflow         | Button       | Request More Info                  |             | Ask employee for clarification                        | [ ]    |
| Approval Workflow         | Dialog       | Approval/Rejection Dialog          |             | Capture action comment                               | [ ]    |

| Dashboard → Documents     | Page         | Documents                          |             | Manage and access documents                           | [ ]    |
| Documents                 | Input        | Search documents                   |             | Filter by title/description                           | [ ]    |
| Documents                 | Select       | Category Filter                    |             | Filter by category                                   | [ ]    |
| Documents List            | Button       | Download                           |             | Download document                                    | [ ]    |
| Documents List            | Button       | Share                              |             | Share document (trigger share action)                | [ ]    |
| Documents List            | Button       | Delete                             |             | Delete document (opens confirmation dialog)          | [ ]    |
| Documents List            | Dialog       | Delete Confirmation                |             | Confirm deletion via /api/documents/:id DELETE       | [ ]    |
| Documents → Upload        | Form         | Document Upload Form               |             | Enter metadata and select files                      | [ ]    |
| Document Upload           | Dropzone     | Drag & Drop Area                   |             | Accept allowed files, show progress                  | [ ]    |
| Document Upload           | Select       | Category                           |             | Select document category                             | [ ]    |
| Document Upload           | Input        | Title                              |             | Enter document title                                 | [ ]    |
| Document Upload           | Textarea     | Description                        |             | Optional description                                 | [ ]    |
| Document Upload           | Button       | Upload                             |             | Upload to storage and create record                  | [ ]    |
| Documents → Export        | Dialog       | Export Documents                   |             | Choose format and export filtered set                | [ ]    |
| Document Export           | Select       | Export Format (csv/excel/pdf)      |             | Select output format                                 | [ ]    |
| Document Export           | Button       | Export                             |             | Triggers file download                               | [ ]    |

| Dashboard → Calendar      | Page         | Team Calendar                      |             | View events                                         | [ ]    |
| Team Calendar             | Button       | Previous / Next                    |             | Navigate across months/weeks                          | [ ]    |
| Team Calendar             | Button       | Add Event                          |             | Open event form                                     | [ ]    |
| Calendar Event Form       | Input/Select | Event Fields                       |             | Create calendar event via API                        | [ ]    |

| Dashboard → Reports       | Page         | Reports Dashboard                  |             | View charts and KPIs                                 | [ ]    |
| Reports                   | Select       | Filters (type/department/date)     |             | Adjust report inputs                                 | [ ]    |
| Reports                   | Button       | Export Report                      |             | Export report data (CSV/Excel/PDF)                   | [ ]    |

| Dashboard → Diagnostics   | Page         | Diagnostics                        |             | System diagnostics view                              | [ ]    |
| Diagnostics               | Button       | Run Diagnostics                    |             | Execute health checks                                | [ ]    |

| Admin → Users             | Page         | User Management                    |             | Manage users                                         | [ ]    |
| User Management           | Input        | Search Users                       |             | Filter users by name/email                           | [ ]    |
| User Management           | Button       | Add User                           |             | Open create user dialog                              | [ ]    |
| User Management           | Dialog       | Create / Edit User                 |             | Capture user details                                 | [ ]    |
| User Management           | Button       | Edit                               |             | Edit user profile                                    | [ ]    |
| User Management           | Button       | Delete                             |             | Delete user (with confirm)                           | [ ]    |
| User Management           | Select       | Department                         |             | Assign department                                    | [ ]    |
| User Management           | Select       | Role                               |             | Assign role (employee/manager/hr/admin)              | [ ]    |
| User Management           | Checkbox     | Active                             |             | Toggle active/inactive                               | [ ]    |

| Admin → Roles             | Page         | Role Management                    |             | Manage roles and permissions                          | [ ]    |
| Role Management           | Button       | Create Role                        |             | Open create role dialog                              | [ ]    |
| Role Management           | Button       | Update Role                        |             | Save role changes                                    | [ ]    |
| Role Management           | Button       | Delete Role                        |             | Remove role (with confirm)                           | [ ]    |
| Role Management           | Checkbox     | Permission Toggle                  |             | Enable/disable permissions per resource              | [ ]    |
| Role Management           | Input        | Search Permissions                 |             | Filter permissions                                   | [ ]    |
| Role Management           | Dialog       | Assign Users to Role               |             | Assign/unassign users                                | [ ]    |

| Admin → Audit Logs        | Page         | Audit Log Viewer                   |             | Review system activities                             | [ ]    |
| Audit Logs                | Input        | Search logs                        |             | Filter by action/table/user                           | [ ]    |
| Audit Logs                | Select       | Action Filter                      |             | Filter by action                                     | [ ]    |
| Audit Logs                | Select       | Table Filter                       |             | Filter by table                                      | [ ]    |

| Header / Navigation       | Nav          | Main Nav Links                     |             | Navigate across app                                  | [ ]    |
| Header / Navigation       | Button       | Theme Toggle                       |             | Switch light/dark theme                              | [ ]    |
| Header / Navigation       | Dropdown     | User Menu                          |             | Open profile, sign out, etc.                         | [ ]    |
| Header / Notifications    | Button       | Notification Bell                  |             | Open notification center                             | [ ]    |
| Notification Center       | Button       | Mark All Read                      |             | Mark notifications as read                           | [ ]    |
| Notification Center       | List         | Notification Items                 |             | View/visit notification details                      | [ ]    |

| Misc / UI Components      | Dialog       | Alert Dialog                       |             | Confirm actions                                      | [ ]    |
| Misc / UI Components      | Tabs         | Tabs                               |             | Switch content sections                              | [ ]    |
| Misc / UI Components      | Table        | Table                              |             | Render tabular data                                  | [ ]    |
| Misc / UI Components      | Select       | Select                             |             | Choose from options                                  | [ ]    |
| Misc / UI Components      | Checkbox     | Checkbox                           |             | Toggle binary option                                 | [ ]    |
| Misc / UI Components      | Input        | Input                              |             | Text inputs                                          | [ ]    |
| Misc / UI Components      | Button       | Button                             |             | Trigger actions                                      | [ ]    |

---------------------------------------------------------------------------------------------

Notes:
- As you test, add rows for any additional buttons or flows not covered here (e.g., Outlook integrations, advanced reporting filters, storage actions) and mark their status.
- Link failures to bug tickets and include reproduction steps, environment details, and screenshots.
- When testing RLS-sensitive features (Documents, Leaves), verify data visibility based on role (admin/hr/manager/employee) and department.