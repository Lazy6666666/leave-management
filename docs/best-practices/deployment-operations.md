# Deployment & Operations Best Practices

## Table of Contents
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Strategies](#deployment-strategies)
- [Monitoring & Observability](#monitoring--observability)
- [Incident Response](#incident-response)
- [Infrastructure as Code](#infrastructure-as-code)
- [Security Operations](#security-operations)
- [Performance Monitoring](#performance-monitoring)
- [Backup & Recovery](#backup--recovery)

## CI/CD Pipeline

### GitHub Actions Workflow Structure

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate repository structure
        run: npm run validate-structure

      - name: Type checking
        run: npm run type-check

      - name: Linting
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit

      - name: Build application
        run: npm run build

  e2e-tests:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Supabase local
        run: npm run supabase:start

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-deployment Checks

```typescript
// scripts/pre-deploy-checks.ts
import { createClient } from '@supabase/supabase-js'

interface PreDeployCheck {
  name: string
  check: () => Promise<boolean>
  critical: boolean
}

export async function runPreDeployChecks(): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const checks: PreDeployCheck[] = [
    {
      name: 'Database connectivity',
      check: async () => {
        const { error } = await supabase.from('employees').select('count').limit(1)
        return !error
      },
      critical: true
    },
    {
      name: 'RLS policies active',
      check: async () => {
        // Verify RLS is enabled on all tables
        const { data } = await supabase.rpc('check_rls_status')
        return data?.all_enabled === true
      },
      critical: true
    },
    {
      name: 'Storage buckets configured',
      check: async () => {
        const { data } = await supabase.storage.listBuckets()
        return data && data.length > 0
      },
      critical: true
    }
  ]

  for (const check of checks) {
    try {
      const passed = await check.check()
      if (!passed && check.critical) {
        throw new Error(`Critical check failed: ${check.name}`)
      }
    } catch (error) {
      console.error(`Check failed: ${check.name}`, error)
      if (check.critical) {
        process.exit(1)
      }
    }
  }
}
```

## Deployment Strategies

### Vercel Deployment Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "frontend/pages/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Blue-Green Deployment Pattern

```typescript
// scripts/blue-green-deploy.ts
interface DeploymentConfig {
  environment: 'staging' | 'production'
  strategy: 'blue-green' | 'rolling'
  healthCheckUrl: string
}

export async function deployWithBlueGreen(config: DeploymentConfig) {
  // 1. Deploy to green environment
  await deployToEnvironment('green', config)

  // 2. Run health checks
  await runHealthChecks(config.healthCheckUrl.replace('blue', 'green'))

  // 3. Switch traffic to green
  await switchTraffic('green', config.environment)

  // 4. Keep blue as rollback option
  console.log('Deployment successful. Blue environment ready for rollback.')
}
```

## Monitoring & Observability

### Application Performance Monitoring

```typescript
// lib/monitoring.ts
import { NextApiRequest, NextApiResponse } from 'next'

export interface MetricsData {
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  errorRate: number
  requestCount: number
}

export function collectMetrics(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime

    // Send metrics to monitoring service
    sendMetrics({
      endpoint: req.url,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    })
  })
}

async function sendMetrics(metrics: any) {
  // Send to your monitoring service (DataDog, New Relic, etc.)
  await fetch('https://monitoring-service.com/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  })
}
```

### Custom Business Metrics

```typescript
// lib/business-metrics.ts
export interface BusinessMetrics {
  dailyActiveUsers: number
  leaveRequestsCreated: number
  leaveRequestsApproved: number
  averageApprovalTime: number
  documentUploads: number
  systemErrors: number
}

export async function trackBusinessMetrics(): Promise<BusinessMetrics> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Daily active users
  const { count: dailyActiveUsers } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString())

  // Leave requests created today
  const { count: leaveRequestsCreated } = await supabase
    .from('leaves')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString())

  return {
    dailyActiveUsers: dailyActiveUsers || 0,
    leaveRequestsCreated: leaveRequestsCreated || 0,
    leaveRequestsApproved: 0, // Calculate from leaves table
    averageApprovalTime: 0, // Calculate from leaves with approved_at
    documentUploads: 0, // Calculate from company_documents
    systemErrors: 0 // Calculate from error logs
  }
}
```

## Incident Response

### Incident Response Playbook

```markdown
# Incident Response Runbook

## 1. Detection & Assessment
- Monitor alerts from monitoring dashboard
- Check system health endpoints
- Verify database connectivity
- Check recent error logs

## 2. Classification
- **P0 (Critical)**: System down, data loss, security breach
- **P1 (High)**: Major feature broken, performance severely degraded
- **P2 (Medium)**: Minor feature broken, performance degraded
- **P3 (Low)**: Cosmetic issues, minor improvements

## 3. Response Procedures

### Database Connection Issues
```bash
# Check database connectivity
npm run db:health

# View recent logs
npm run logs:recent

# Restart database connections
npm run db:restart-connections
```

### Performance Degradation
```typescript
// Check slow queries
const slowQueries = await supabase
  .rpc('get_slow_queries', { threshold_ms: 1000 })

// Identify problematic queries
slowQueries.forEach(query => {
  console.log(`Slow query detected: ${query.query} (${query.duration}ms)`)
})
```

## 4. Communication
- Internal: Slack #incidents channel
- External: Status page update
- Stakeholders: Email notification for P0/P1 incidents

## 5. Post-Mortem
- Document root cause
- Identify preventive measures
- Update runbooks
- Schedule follow-up actions
```

### Automated Alerting Rules

```typescript
// lib/alerting.ts
export interface AlertRule {
  name: string
  condition: string
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  notificationChannels: string[]
}

export const alertRules: AlertRule[] = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 0.05', // 5% error rate
    threshold: 5,
    severity: 'critical',
    notificationChannels: ['slack', 'email', 'sms']
  },
  {
    name: 'Slow Response Time',
    condition: 'avg_response_time > 2000', // 2 seconds
    threshold: 2000,
    severity: 'warning',
    notificationChannels: ['slack', 'email']
  },
  {
    name: 'Database Connection Pool Exhausted',
    condition: 'active_connections > max_connections * 0.9',
    threshold: 90,
    severity: 'critical',
    notificationChannels: ['slack', 'email', 'pager']
  }
]
```

## Infrastructure as Code

### Supabase Configuration Management

```typescript
// supabase/config.ts
export interface SupabaseConfig {
  projectId: string
  database: {
    version: string
    settings: {
      maxConnections: number
      sharedBuffers: string
      workMem: string
    }
  }
  auth: {
    enabled: boolean
    settings: {
      enableSignup: boolean
      emailConfirmationRequired: boolean
      passwordMinLength: number
    }
  }
  storage: {
    buckets: Array<{
      name: string
      public: boolean
      allowedMimeTypes: string[]
      maxSize: number
    }>
  }
}

export const supabaseConfig: SupabaseConfig = {
  projectId: process.env.SUPABASE_PROJECT_ID!,
  database: {
    version: '15.1',
    settings: {
      maxConnections: 100,
      sharedBuffers: '256MB',
      workMem: '4MB'
    }
  },
  auth: {
    enabled: true,
    settings: {
      enableSignup: true,
      emailConfirmationRequired: true,
      passwordMinLength: 8
    }
  },
  storage: {
    buckets: [
      {
        name: 'documents',
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024 // 10MB
      }
    ]
  }
}
```

## Security Operations

### Security Monitoring

```typescript
// lib/security-monitoring.ts
export interface SecurityEvent {
  type: 'login_failure' | 'suspicious_activity' | 'unauthorized_access' | 'data_export'
  userId?: string
  ipAddress: string
  userAgent: string
  timestamp: string
  details: Record<string, unknown>
}

export async function logSecurityEvent(event: SecurityEvent) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('security_logs').insert({
    event_type: event.type,
    user_id: event.userId,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    timestamp: event.timestamp,
    details: event.details
  })

  // Send alert for critical security events
  if (isCriticalSecurityEvent(event)) {
    await sendSecurityAlert(event)
  }
}

function isCriticalSecurityEvent(event: SecurityEvent): boolean {
  const criticalTypes = ['unauthorized_access', 'data_export']
  return criticalTypes.includes(event.type)
}
```

### Compliance Monitoring

```typescript
// lib/compliance-monitoring.ts
export async function runComplianceChecks() {
  const checks = [
    {
      name: 'Data Retention Policy',
      check: verifyDataRetentionPolicy
    },
    {
      name: 'PII Access Logging',
      check: verifyPIIAccessLogging
    },
    {
      name: 'Encryption at Rest',
      check: verifyEncryptionAtRest
    },
    {
      name: 'Backup Integrity',
      check: verifyBackupIntegrity
    }
  ]

  const results = []
  for (const check of checks) {
    try {
      const result = await check.check()
      results.push({ name: check.name, passed: result })
    } catch (error) {
      results.push({ name: check.name, passed: false, error: error.message })
    }
  }

  return results
}
```

## Performance Monitoring

### Core Web Vitals Tracking

```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function trackWebVitals() {
  getCLS((metric) => {
    sendMetric('CLS', metric.value)
  })

  getFID((metric) => {
    sendMetric('FID', metric.value)
  })

  getFCP((metric) => {
    sendMetric('FCP', metric.value)
  })

  getLCP((metric) => {
    sendMetric('LCP', metric.value)
  })

  getTTFB((metric) => {
    sendMetric('TTFB', metric.value)
  })
}

async function sendMetric(name: string, value: number) {
  await fetch('/api/metrics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, value, timestamp: Date.now() })
  })
}
```

### Database Performance Monitoring

```sql
-- Create performance monitoring view
CREATE OR REPLACE VIEW performance_monitoring AS
SELECT
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  most_common_vals,
  most_common_freqs,
  CASE
    WHEN n_distinct > 0 THEN
      (SELECT COUNT(*) FROM information_schema.columns c
       WHERE c.table_schema = s.schemaname
       AND c.table_name = s.tablename) / n_distinct::float
    ELSE 0
  END as avg_columns_per_distinct
FROM pg_stats s
JOIN information_schema.columns c ON
  c.table_schema = s.schemaname
  AND c.table_name = s.tablename
  AND c.column_name = s.attname
WHERE schemaname = 'public';
```

## Backup & Recovery

### Automated Backup Strategy

```typescript
// scripts/backup-strategy.ts
export interface BackupConfig {
  database: {
    enabled: boolean
    schedule: string // cron expression
    retentionDays: number
    encryptionKey: string
  }
  fileStorage: {
    enabled: boolean
    schedule: string
    retentionDays: number
    compression: boolean
  }
  application: {
    enabled: boolean
    schedule: string
    retentionDays: number
  }
}

export async function executeBackup(config: BackupConfig) {
  const timestamp = new Date().toISOString()

  // Database backup
  if (config.database.enabled) {
    await backupDatabase({
      timestamp,
      retentionDays: config.database.retentionDays,
      encryptionKey: config.database.encryptionKey
    })
  }

  // File storage backup
  if (config.fileStorage.enabled) {
    await backupFileStorage({
      timestamp,
      retentionDays: config.fileStorage.retentionDays,
      compression: config.fileStorage.compression
    })
  }

  // Application configuration backup
  if (config.application.enabled) {
    await backupApplicationConfig({
      timestamp,
      retentionDays: config.application.retentionDays
    })
  }
}
```

### Disaster Recovery Procedures

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

echo "Starting disaster recovery process..."

# 1. Verify backup integrity
echo "Verifying backup integrity..."
npm run backup:verify

# 2. Restore database
echo "Restoring database from backup..."
npm run db:restore --latest

# 3. Restore file storage
echo "Restoring file storage..."
npm run storage:restore --latest

# 4. Verify system health
echo "Verifying system health..."
npm run health:check

# 5. Notify stakeholders
echo "Notifying stakeholders..."
npm run notify:recovery-complete

echo "Disaster recovery completed successfully!"
```

## Operational Scripts

### Health Check Scripts

```bash
#!/bin/bash
# scripts/health-check.sh

# Check database connectivity
check_database() {
  echo "Checking database connectivity..."
  npm run db:ping || exit 1
}

# Check API endpoints
check_api_endpoints() {
  echo "Checking API endpoints..."

  # Health check endpoint
  curl -f http://localhost:3000/api/health || exit 1

  # Database connectivity endpoint
  curl -f http://localhost:3000/api/db-health || exit 1
}

# Check external services
check_external_services() {
  echo "Checking external services..."

  # Supabase connectivity
  curl -f $SUPABASE_URL/rest/v1/ || exit 1

  # Email service
  curl -f $EMAIL_SERVICE_URL/health || exit 1
}

# Run all checks
check_database
check_api_endpoints
check_external_services

echo "All health checks passed!"
```

### Log Rotation and Management

```typescript
// scripts/log-management.ts
export async function rotateLogs() {
  const logDir = './logs'
  const maxAge = 30 // days
  const maxSize = 100 * 1024 * 1024 // 100MB

  // Rotate large log files
  const files = await readdir(logDir)
  for (const file of files) {
    const filePath = path.join(logDir, file)
    const stats = await stat(filePath)

    if (stats.size > maxSize) {
      await rotateLogFile(filePath)
    }

    if (Date.now() - stats.mtime.getTime() > maxAge * 24 * 60 * 60 * 1000) {
      await archiveLogFile(filePath)
    }
  }
}

async function rotateLogFile(filePath: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const rotatedPath = `${filePath}.${timestamp}`

  await rename(filePath, rotatedPath)
  console.log(`Rotated log file: ${rotatedPath}`)
}
```

## Deployment Checklist

- [ ] Repository structure validation passed
- [ ] TypeScript compilation successful
- [ ] All tests passing (unit + E2E)
- [ ] Security scan completed
- [ ] Performance tests passed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Health check endpoints responding
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified
- [ ] Rollback plan documented
- [ ] Stakeholders notified

## Emergency Contacts

```typescript
// lib/emergency-contacts.ts
export interface EmergencyContact {
  name: string
  role: string
  email: string
  phone: string
  escalationLevel: 1 | 2 | 3
}

export const emergencyContacts: EmergencyContact[] = [
  {
    name: 'Tech Lead',
    role: 'Technical Lead',
    email: 'tech-lead@company.com',
    phone: '+1-555-0100',
    escalationLevel: 1
  },
  {
    name: 'Engineering Manager',
    role: 'Engineering Manager',
    email: 'eng-manager@company.com',
    phone: '+1-555-0101',
    escalationLevel: 2
  },
  {
    name: 'CTO',
    role: 'Chief Technology Officer',
    email: 'cto@company.com',
    phone: '+1-555-0102',
    escalationLevel: 3
  }
]
