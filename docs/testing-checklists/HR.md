# Role-Based Testing Checklist — HR

Scope: Validate HR capabilities: department-wide visibility, leave approvals, holiday/calendar management, HR documents, and reporting.

---------------------------------------------------------------------------------------------
| Page / Area              | Element Type | Label / Identifier               | Functional? | Purpose / Description                                 | Tested |
|--------------------------|--------------|----------------------------------|-------------|-------------------------------------------------------|--------|
| Dashboard → Leaves       | Page         | Leaves List (HR)                  |             | View department employees' leaves                     | [ ]    |
| Leaves                   | Button       | New Leave Request (self)          |             | Create personal leave                                 | [ ]    |
| Approval Workflow        | Table        | Pending Approvals                  |             | Approve/reject department requests                     | [ ]    |
| Approval Workflow        | Button       | Approve                            |             | Approve with comment                                  | [ ]    |
| Approval Workflow        | Button       | Reject                             |             | Reject with comment                                   | [ ]    |
| Approval Workflow        | Button       | Request More Info                  |             | Ask for clarification                                 | [ ]    |

| Dashboard → Calendar     | Button       | Add Holiday/Event                  |             | Create HR calendar event/holiday                      | [ ]    |
| Calendar Event Form      | Input/Select | Event Fields                       |             | Fill event details                                    | [ ]    |
| Team Calendar            | Button       | Previous / Next                    |             | Navigate calendar                                     | [ ]    |

| Dashboard → Documents    | Input        | Search documents (HR category)     |             | Filter HR docs                                        | [ ]    |
| Documents                | Select       | Category Filter: HR                |             | Show HR-specific documents                            | [ ]    |
| Documents List           | Button       | Download                           |             | Download HR document                                  | [ ]    |
| Documents List           | Button       | Share                              |             | Share document                                        | [ ]    |
| Documents → Upload       | Form         | Upload Form                        |             | Upload HR documents                                   | [ ]    |

| Dashboard → Reports      | Select       | Filters (dept/date/type)           |             | Department-focused KPIs                               | [ ]    |
| Reports                  | Button       | Export Report                      |             | Export HR report data                                 | [ ]    |

| Admin (limited)          | Page         | Audit Logs (read)                  |             | Review HR-related actions                             | [ ]    |
| Audit Logs               | Input        | Search logs                        |             | Filter by action/table/user                           | [ ]    |

Notes:
- Validate HR sees only department data for RLS-protected tables (leaves/documents).
- Ensure approvals change status and notify employees/managers appropriately.