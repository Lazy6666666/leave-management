# Role-Based Testing Checklist — Admin

Scope: Validate all admin-specific capabilities across Users, Roles, Audit Logs, Documents, Leaves Approvals, Reports, and Settings.

How to use:
- Functional? ✔/✘ and Tested [x]/[ ] like the master checklist.
- Focus on data visibility (organization-wide) and privileged actions.

---------------------------------------------------------------------------------------------
| Page / Area              | Element Type | Label / Identifier               | Functional? | Purpose / Description                                 | Tested |
|--------------------------|--------------|----------------------------------|-------------|-------------------------------------------------------|--------|
| Dashboard → Admin        | Page         | Admin Overview                    |             | Loads admin tools navigation                          | [ ]    |
| Admin → Users            | Input        | Search Users                      |             | Filter users by name/email                            | [ ]    |
| Admin → Users            | Button       | Add User                          |             | Open create user dialog                               | [ ]    |
| Admin → Users            | Dialog       | Create / Edit User                |             | Capture user details (name, email, dept, role)        | [ ]    |
| Admin → Users            | Button       | Edit                              |             | Edit user profile                                     | [ ]    |
| Admin → Users            | Button       | Delete                            |             | Delete user (with confirmation)                       | [ ]    |
| Admin → Users            | Select       | Department                        |             | Assign department                                     | [ ]    |
| Admin → Users            | Select       | Role                               |             | Assign role (employee/manager/hr/admin)               | [ ]    |
| Admin → Users            | Checkbox     | Active                             |             | Toggle active/inactive                                | [ ]    |

| Admin → Roles            | Button       | Create Role                        |             | Open create role dialog                               | [ ]    |
| Admin → Roles            | Button       | Update Role                        |             | Save role changes                                     | [ ]    |
| Admin → Roles            | Button       | Delete Role                        |             | Remove role (with confirmation)                       | [ ]    |
| Admin → Roles            | Checkbox     | Permission Toggle                  |             | Enable/disable permissions per resource               | [ ]    |
| Admin → Roles            | Input        | Search Permissions                 |             | Filter permissions                                    | [ ]    |
| Admin → Roles            | Dialog       | Assign Users to Role               |             | Assign/unassign users                                 | [ ]    |

| Admin → Audit Logs       | Input        | Search logs                        |             | Filter by action/table/user                           | [ ]    |
| Admin → Audit Logs       | Select       | Action Filter                      |             | Filter by action                                      | [ ]    |
| Admin → Audit Logs       | Select       | Table Filter                       |             | Filter by table                                       | [ ]    |
| Admin → Audit Logs       | Details      | View Changes                       |             | Expand to see old/new values                          | [ ]    |

| Documents (Admin view)   | Input        | Search documents                   |             | Filter documents across org                           | [ ]    |
| Documents                | Select       | Category Filter                    |             | Filter by category                                    | [ ]    |
| Documents List           | Button       | Download                           |             | Download document                                     | [ ]    |
| Documents List           | Button       | Share                              |             | Share document                                        | [ ]    |
| Documents List           | Button       | Delete                             |             | Delete document (with confirmation)                   | [ ]    |
| Documents → Upload       | Form         | Upload Form                        |             | Enter metadata and select files                       | [ ]    |
| Documents → Export       | Dialog       | Export Documents                   |             | Export filtered set                                   | [ ]    |

| Leaves Approvals (Admin) | Table        | Pending Approvals                  |             | Organization-wide approvals list                      | [ ]    |
| Approval Workflow        | Button       | Approve                            |             | Approve request with comment                          | [ ]    |
| Approval Workflow        | Button       | Reject                             |             | Reject request with comment                           | [ ]    |
| Approval Workflow        | Button       | Request More Info                  |             | Ask employee for clarification                        | [ ]    |

| Reports (Admin)          | Select       | Department Filter                  |             | Filter KPIs/charts by department                       | [ ]    |
| Reports (Admin)          | Button       | Export Report                      |             | Export report data (CSV/Excel/PDF)                    | [ ]    |

| Settings / Diagnostics   | Button       | Run Diagnostics                    |             | Execute health checks                                 | [ ]    |

Notes:
- Verify RLS allows admin visibility across departments for leaves/documents where appropriate.
- Confirm audit trail entries appear for all admin actions (user/role changes, deletions, exports).