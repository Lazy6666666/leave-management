# Role-Based Testing Checklist — Employee

Scope: Validate employee capabilities: authentication, personal leaves, personal documents, calendar, notifications, and profile actions.

---------------------------------------------------------------------------------------------
| Page / Area              | Element Type | Label / Identifier               | Functional? | Purpose / Description                                 | Tested |
|--------------------------|--------------|----------------------------------|-------------|-------------------------------------------------------|--------|
| Auth → Login             | Form         | Login Form                         |             | Sign in to the system                                 | [ ]    |
| Auth → Register          | Form         | Registration Form                  |             | Create account                                        | [ ]    |
| Auth → Reset Password    | Form         | Reset Password Form                |             | Request password reset                                | [ ]    |

| Dashboard → Leaves       | Page         | My Leaves                          |             | View personal leave requests                          | [ ]    |
| Leave Request Form       | Select       | Leave Type                         |             | Choose leave type                                     | [ ]    |
| Leave Request Form       | DatePicker   | Start Date                         |             | Pick start date                                       | [ ]    |
| Leave Request Form       | DatePicker   | End Date                           |             | Pick end date                                         | [ ]    |
| Leave Request Form       | Button       | Submit Leave Request               |             | Create personal leave                                 | [ ]    |
| Leaves Detail            | Button       | Cancel                             |             | Cancel personal leave request                         | [ ]    |

| Dashboard → Documents    | Input        | Search my documents                |             | Filter personal docs                                  | [ ]    |
| Documents List           | Button       | Download                           |             | Download document                                     | [ ]    |
| Documents                | Button       | Upload                             |             | Upload personal document                              | [ ]    |

| Dashboard → Calendar     | Page         | My Calendar                        |             | View personal/team events                             | [ ]    |
| Team Calendar            | Button       | Add Event                          |             | Create event                                          | [ ]    |

| Header / Notifications   | Button       | Notification Bell                  |             | Open notification center                              | [ ]    |
| Notification Center      | Button       | Mark All Read                      |             | Mark notifications as read                            | [ ]    |

| Header / User Menu       | Dropdown     | Profile                            |             | View/update profile                                   | [ ]    |
| Header / User Menu       | Button       | Sign Out                           |             | Sign out                                              | [ ]    |

Notes:
- Validate employee cannot see other departments' documents or leaves (RLS enforcement).
- Confirm email notifications on approvals/rejections if configured.