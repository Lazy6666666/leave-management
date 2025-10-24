# Role-Based Testing Checklist — Manager

Scope: Validate manager capabilities: team visibility, approvals, team calendar, team documents, and reporting.

---------------------------------------------------------------------------------------------
| Page / Area              | Element Type | Label / Identifier               | Functional? | Purpose / Description                                 | Tested |
|--------------------------|--------------|----------------------------------|-------------|-------------------------------------------------------|--------|
| Dashboard → Leaves       | Table        | Team Leave Requests                |             | View team requests                                    | [ ]    |
| Leaves                   | Button       | New Leave Request (self)          |             | Create personal leave                                 | [ ]    |
| Approval Workflow        | Table        | Pending Approvals                  |             | Approve/reject team requests                          | [ ]    |
| Approval Workflow        | Button       | Approve                            |             | Approve with comment                                  | [ ]    |
| Approval Workflow        | Button       | Reject                             |             | Reject with comment                                   | [ ]    |
| Approval Workflow        | Button       | Request More Info                  |             | Ask for clarification                                 | [ ]    |

| Dashboard → Calendar     | Page         | Team Calendar                      |             | View team events                                      | [ ]    |
| Team Calendar            | Button       | Add Event                          |             | Create team event                                     | [ ]    |
| Team Calendar            | Button       | Previous / Next                    |             | Navigate calendar                                     | [ ]    |

| Dashboard → Documents    | Input        | Search team documents              |             | Filter team docs                                      | [ ]    |
| Documents                | Select       | Category Filter                    |             | Filter by category                                    | [ ]    |
| Documents List           | Button       | Download                           |             | Download document                                     | [ ]    |
| Documents                | Button       | Upload                             |             | Upload team document                                  | [ ]    |

| Dashboard → Reports      | Select       | Filters (team/date/type)           |             | Team KPIs                                             | [ ]    |
| Reports                  | Button       | Export Report                      |             | Export team report data                               | [ ]    |

Notes:
- Validate manager sees only team data for RLS-protected tables.
- Ensure actions notify team members and appear in audit logs where applicable.