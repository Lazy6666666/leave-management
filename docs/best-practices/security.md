# Security Implementation Best Practices

## Table of Contents
- [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
- [Authentication & Authorization](#authentication--authorization)
- [OWASP Guidelines](#owasp-guidelines)
- [File Upload Security](#file-upload-security)
- [Environment Variables & Secrets](#environment-variables--secrets)
- [Security Headers](#security-headers)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [PII Handling & Compliance](#pii-handling--compliance)
- [Audit Logging](#audit-logging)
- [Rate Limiting](#rate-limiting)

## Row-Level Security (RLS) Policies

### RLS Policy Patterns
- **Enable RLS on all tables**: `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`
- **Employee self-read/write policy**: Allow users to read/write their own employee record
- **Manager department access**: Managers can read employee records in their department
- **Admin full access**: Admin/HR role users have full read/write access
- **Leave request policies**:
  - Requester can read/write their own requests
  - Approved requesters' data visible to approvers
  - Status-based access controls

### Policy Implementation Rules
- Use `auth.uid()` for user identification
- Implement through helper functions like `get_employee_id_by_supabase_uid(uuid)`
- Enforce approver role checks for status changes
- Calendar data should filter sensitive fields based on user role

## Authentication & Authorization

### Supabase Auth Patterns
- Use JWT-based authentication with session cookies
- Implement role-based authorization checks on server-side API routes
- Validate user permissions before data access operations
- Use Supabase Auth helpers for frontend `@supabase/ssr` and backend `@supabase/auth-helpers-nextjs`

### Role-Based Access Control (RBAC)
- Roles: employee, manager, admin, hr
- Hierarchical permissions: admin > hr > manager > employee
- Server-side validation on all sensitive operations
- Frontend conditional rendering based on user role

## OWASP Guidelines

### Top 10 Security Risks Mitigation
- **Injection**: Use parameterized queries and Zod schema validation
- **Broken Authentication**: Strong password policies, JWT expiration
- **Sensitive Data Exposure**: Encrypt sensitive data, HTTPS only
- **XML External Entities (XXE)**: Validate file uploads, limit file types
- **Broken Access Control**: Implement proper RLS policies
- **Security Misconfiguration**: Secure environment variables, minimal permissions
- **Cross-Site Scripting (XSS)**: Sanitize inputs, use React's XSS protection
- **Insecure Deserialization**: Validate all serialized data
- **Components with Known Vulnerabilities**: Keep dependencies updated
- **Insufficient Logging & Monitoring**: Implement audit logs and error tracking

## File Upload Security

### File Upload Handling
- Validate file types: `image/jpeg`, `image/png`, `application/pdf`
- Implement file size limits (max 10MB for documents)
- Store uploads in Supabase Storage with user-specific folders
- Generate signed URLs for secure file access
- Scan for malware on uploads (consider using third-party services)

### Security Best Practices
- Never trust client-side validation
- Use server-side validation for all file operations
- Implement CSRF protection for upload forms
- Expire file URLs within 24 hours
- Log all file upload/download operations

## Environment Variables & Secrets

### Secret Management
- Store secrets in Vercel environment variables (NEXT_PUBLIC_ prefaced only for client needs)
- Use Supabase service role keys only server-side
- Implement environment validation on application startup
- Rotate secrets regularly and upon compromise

### Environment Configuration
- Separate development, staging, and production configurations
- Use `.env.local` for local development (gitignored)
- Validate required env vars: SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, SENDGRID_KEY

## Security Headers

### Recommended Headers for Next.js
- `Content-Security-Policy`: Restrict scripts, styles, and resources
- `X-Frame-Options`: DENY (prevent clickjacking)
- `X-Content-Type-Options`: nosniff (prevent MIME sniffing)
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: Restrict dangerous APIs
- `Strict-Transport-Security`: IncludeSubDomains; preload

### Implementation in Next.js
- Use `next.config.js` to set security headers
- Implement middleware for headers that require dynamic values
- Test headers using security scanning tools

## Input Validation & Sanitization

### Validation Strategies
- Use Zod schemas for all API inputs and form data
- Implement server-side validation with TypeScript types
- Sanitize HTML inputs using libraries like `DOMPurify`
- Validate file paths and prevent directory traversal

### Type Safety
- Strict TypeScript configuration: `"noImplicitAny": true`
- Use proper types for all user inputs
- Implement schema validation before database operations

## PII Handling & Compliance

### PII Processing Rules
- Minimize data collection to business needs
- Encrypt sensitive PII at rest and in transit
- Implement proper retention policies (7 years for documents)
- Provide data access and deletion requests processing

### GDPR Compliance
- Implement audit trails for PII access
- Handle user consent for data processing
- Support anonymization and soft deletion
- Document data processing purposes

## Audit Logging

### Logging Requirements
- Log all admin operations, leave approvals, file uploads
- Include user_id, action type, old/new values, IP address
- Store logs in `audit_logs` table with immutable records
- Use structured JSON logging for production monitoring

### Implementation
- Server-side logging for all sensitive operations
- Client-side logging for user actions (non-sensitive)
- Integration with monitoring tools (Sentry for errors)
- Regular log reviews and alerting on anomalies

## Rate Limiting

### Rate Limiting Strategies
- API rate limits: 600 requests/10min for authenticated users
- File upload limits: Restrict uploads per user per hour
- Login attempts: Lock accounts after failed attempts
- Export operations: Queue heavy reports to prevent overload

### Implementation
- Use Vercel Edge Middleware for global rate limiting
- Store limits in Redis or Supabase PG for server-side checks
- Implement backpressure for concurrent database operations
