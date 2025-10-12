# Data Management Best Practices

## Table of Contents
- [Database Migrations](#database-migrations)
- [Data Retention & Compliance](#data-retention--compliance)
- [Audit Trails & Logging](#audit-trails--logging)
- [Data Backup & Recovery](#data-backup--recovery)
- [GDPR & Privacy Compliance](#gdpr--privacy-compliance)
- [Data Quality & Validation](#data-quality--validation)
- [Data Archival](#data-archival)
- [Data Access & Security](#data-access--security)

## Database Migrations

### Migration Strategy

```typescript
// supabase/migrations/001_initial_schema.sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin', 'hr');
  EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
  EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  role user_role NOT NULL DEFAULT 'employee',
  department text,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT employees_email_unique UNIQUE (email)
);

-- Create leave_types table
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  default_allocation_days integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  total_days integer NOT NULL DEFAULT 0,
  used_days integer NOT NULL DEFAULT 0,
  year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT leave_balances_employee_type_year_unique
  UNIQUE (employee_id, leave_type_id, year)
);

-- Create leaves table
CREATE TABLE IF NOT EXISTS public.leaves (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days_count integer NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  reason text,
  approver_id uuid REFERENCES public.employees(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT leaves_valid_dates CHECK (end_date >= start_date),
  CONSTRAINT leaves_positive_days CHECK (days_count > 0)
);

-- Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_supabase_id ON public.employees(supabase_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_leaves_requester_id ON public.leaves(requester_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_type_year ON public.leave_balances(employee_id, leave_type_id, year);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_company_documents_expiry ON public.company_documents(expiry_date);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Employees: users can see their own profile, managers see their department, admins see all
CREATE POLICY "employees_self_access" ON public.employees
  FOR SELECT USING (supabase_id = auth.uid());

CREATE POLICY "employees_department_access" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = employees.department
    )
  );

CREATE POLICY "employees_admin_access" ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('admin', 'hr')
    )
  );

-- Leaves: requesters see their own, approvers see assigned, managers see department
CREATE POLICY "leaves_requester_access" ON public.leaves
  FOR SELECT USING (
    requester_id IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

CREATE POLICY "leaves_approver_access" ON public.leaves
  FOR ALL USING (
    approver_id IN (
      SELECT id FROM public.employees WHERE supabase_id = auth.uid()
    )
  );

CREATE POLICY "leaves_department_access" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.supabase_id = auth.uid()
      AND e.role IN ('manager', 'admin', 'hr')
      AND e.department = employees.department
    )
  );

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT e.role INTO user_role
  FROM public.employees e
  WHERE e.supabase_id = auth.uid();

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available leave days
CREATE OR REPLACE FUNCTION get_available_leave_days(
  p_employee_id uuid,
  p_leave_type_id uuid,
  p_year integer
) RETURNS integer AS $$
DECLARE
  available_days integer;
BEGIN
  SELECT COALESCE(lb.total_days - lb.used_days, 0) INTO available_days
  FROM public.leave_balances lb
  WHERE lb.employee_id = p_employee_id
  AND lb.leave_type_id = p_leave_type_id
  AND lb.year = p_year;

  RETURN available_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Migration Management

```typescript
// scripts/migration-manager.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface Migration {
  id: string
  name: string
  applied_at?: string
  checksum: string
}

export class MigrationManager {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async checkSchemaIntrospection(): Promise<void> {
    console.log('🔍 Checking schema introspection...')

    // Get current database schema
    const { data: tables } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    const { data: columns } = await this.supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('column_schema', 'public')

    // Compare with expected schema
    const expectedTables = [
      'employees', 'leave_types', 'leave_balances',
      'leaves', 'company_documents', 'audit_logs'
    ]

    const missingTables = expectedTables.filter(table =>
      !tables?.some((t: any) => t.table_name === table)
    )

    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`)
    }

    console.log('✅ Schema introspection passed')
  }

  async applyMigrations(): Promise<void> {
    await this.checkSchemaIntrospection()

    const migrationsDir = path.join(process.cwd(), 'supabase/migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of migrationFiles) {
      const migrationId = path.basename(file, '.sql')
      const { data: existing } = await this.supabase
        .from('migrations')
        .select('id')
        .eq('id', migrationId)
        .single()

      if (existing) {
        console.log(`⏭️  Migration ${migrationId} already applied`)
        continue
      }

      console.log(`🚀 Applying migration: ${migrationId}`)

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

      // Apply migration in transaction
      const { error } = await this.supabase.rpc('exec_sql', { sql })

      if (error) {
        throw new Error(`Failed to apply migration ${migrationId}: ${error.message}`)
      }

      // Record migration
      await this.supabase.from('migrations').insert({
        id: migrationId,
        applied_at: new Date().toISOString()
      })

      console.log(`✅ Migration ${migrationId} applied successfully`)
    }
  }
}
```

## Data Retention & Compliance

### Data Retention Policies

```typescript
// lib/data-retention.ts
export interface RetentionPolicy {
  tableName: string
  retentionDays: number
  archiveAfterDays?: number
  deleteAfterDays: number
  priority: 'high' | 'medium' | 'low'
}

export const retentionPolicies: RetentionPolicy[] = [
  {
    tableName: 'audit_logs',
    retentionDays: 2555, // 7 years
    deleteAfterDays: 2555,
    priority: 'high'
  },
  {
    tableName: 'leaves',
    retentionDays: 1825, // 5 years
    deleteAfterDays: 1825,
    priority: 'high'
  },
  {
    tableName: 'company_documents',
    retentionDays: 1825, // 5 years
    archiveAfterDays: 365, // Archive after 1 year
    deleteAfterDays: 1825,
    priority: 'high'
  },
  {
    tableName: 'leave_balances',
    retentionDays: 365, // 1 year
    deleteAfterDays: 365,
    priority: 'medium'
  }
]

export async function enforceRetentionPolicies(): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const policy of retentionPolicies) {
    console.log(`🧹 Enforcing retention policy for ${policy.tableName}`)

    // Archive old records if archiveAfterDays is set
    if (policy.archiveAfterDays) {
      await archiveOldRecords(policy.tableName, policy.archiveAfterDays)
    }

    // Delete expired records
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - policy.deleteAfterDays)

    const { error } = await supabase
      .from(policy.tableName)
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      console.error(`Failed to delete old records from ${policy.tableName}:`, error)
    } else {
      console.log(`✅ Cleaned up old records from ${policy.tableName}`)
    }
  }
}

async function archiveOldRecords(tableName: string, archiveAfterDays: number): Promise<void> {
  // Implementation for archiving records to cold storage
  // This would typically involve moving data to archive tables or external storage
}
```

### GDPR Compliance Implementation

```typescript
// lib/gdpr-compliance.ts
export interface GDPRRequest {
  id: string
  userId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'restrict' | 'portability'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
  completedAt?: string
  data?: any
}

export class GDPRManager {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async processDataAccessRequest(userId: string): Promise<any> {
    // Collect all user data
    const userData = {
      profile: await this.getUserProfile(userId),
      leaves: await this.getUserLeaves(userId),
      documents: await this.getUserDocuments(userId),
      auditLogs: await this.getUserAuditLogs(userId)
    }

    // Log the access request
    await this.logGDPREvent({
      userId,
      action: 'data_access_provided',
      details: { dataTypes: Object.keys(userData) }
    })

    return userData
  }

  async processDataDeletionRequest(userId: string): Promise<void> {
    // Soft delete: mark as inactive rather than hard delete
    await this.supabase
      .from('employees')
      .update({
        is_active: false,
        email: `deleted-${userId}@deleted.local`,
        first_name: '[DELETED]',
        last_name: '[USER]'
      })
      .eq('id', userId)

    // Anonymize related data
    await this.anonymizeUserData(userId)

    // Log the deletion
    await this.logGDPREvent({
      userId,
      action: 'data_deletion_completed',
      details: { anonymizedTables: ['leaves', 'documents', 'audit_logs'] }
    })
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('employees')
      .select('*')
      .eq('id', userId)
      .single()

    return data
  }

  private async getUserLeaves(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('leaves')
      .select('*')
      .eq('requester_id', userId)

    return data || []
  }

  private async getUserDocuments(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('company_documents')
      .select('*')
      .eq('uploaded_by', userId)

    return data || []
  }

  private async getUserAuditLogs(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)

    return data || []
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    // Anonymize leaves
    await this.supabase
      .from('leaves')
      .update({
        reason: '[REDACTED]',
        metadata: { anonymized: true }
      })
      .eq('requester_id', userId)

    // Anonymize documents metadata
    await this.supabase
      .from('company_documents')
      .update({
        metadata: { anonymized: true, original_user_id: userId }
      })
      .eq('uploaded_by', userId)
  }

  private async logGDPREvent(event: any): Promise<void> {
    await this.supabase.from('gdpr_logs').insert({
      user_id: event.userId,
      action: event.action,
      details: event.details,
      created_at: new Date().toISOString()
    })
  }
}
```

## Audit Trails & Logging

### Comprehensive Audit Logging

```typescript
// lib/audit-logger.ts
import { createClient } from '@supabase/supabase-js'

export interface AuditEvent {
  userId?: string
  action: string
  tableName: string
  recordId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: event.userId,
        action: event.action,
        table_name: event.tableName,
        record_id: event.recordId,
        old_values: event.oldValues,
        new_values: event.newValues,
        metadata: {
          ...event.metadata,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to log audit event:', error)
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      tableName: 'user_actions',
      metadata: details
    })
  }

  async logDataChange(
    userId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'UPDATE',
      tableName,
      recordId,
      oldValues,
      newValues
    })
  }

  async logDataAccess(
    userId: string,
    tableName: string,
    recordId: string,
    accessType: 'read' | 'export' | 'download'
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `DATA_${accessType.toUpperCase()}`,
      tableName,
      recordId,
      metadata: { accessType }
    })
  }
}
```

### Audit Log Views and Queries

```sql
-- Create audit log summary view
CREATE OR REPLACE VIEW audit_summary AS
SELECT
  DATE_TRUNC('day', created_at) as audit_date,
  user_id,
  action,
  table_name,
  COUNT(*) as event_count,
  array_agg(DISTINCT record_id) as affected_records
FROM public.audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), user_id, action, table_name
ORDER BY audit_date DESC;

-- Function to get audit trail for specific record
CREATE OR REPLACE FUNCTION get_audit_trail(p_record_id uuid, p_table_name text)
RETURNS TABLE (
  audit_id uuid,
  action text,
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.user_id,
    al.old_values,
    al.new_values,
    al.created_at
  FROM public.audit_logs al
  WHERE al.record_id = p_record_id
    AND al.table_name = p_table_name
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Backup & Recovery

### Automated Backup System

```typescript
// scripts/backup-system.ts
export interface BackupConfig {
  database: {
    enabled: boolean
    schedule: string // cron expression
    retentionDays: number
    encryptionKey: string
    compression: boolean
  }
  storage: {
    enabled: boolean
    schedule: string
    retentionDays: number
    includeVersions: boolean
  }
  application: {
    enabled: boolean
    schedule: string
    retentionDays: number
    includeUploads: boolean
  }
}

export class BackupSystem {
  private supabase: any
  private config: BackupConfig

  constructor(config: BackupConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async createFullBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupId = `backup-${timestamp}`

    console.log(`🔄 Creating full backup: ${backupId}`)

    // Database backup
    if (this.config.database.enabled) {
      await this.backupDatabase(backupId)
    }

    // Storage backup
    if (this.config.storage.enabled) {
      await this.backupStorage(backupId)
    }

    // Application files backup
    if (this.config.application.enabled) {
      await this.backupApplication(backupId)
    }

    // Record backup metadata
    await this.recordBackup(backupId, 'full')

    console.log(`✅ Full backup completed: ${backupId}`)
    return backupId
  }

  private async backupDatabase(backupId: string): Promise<void> {
    // Use pg_dump or Supabase's backup tools
    const { exec } = require('child_process')

    return new Promise((resolve, reject) => {
      const command = `pg_dump ${process.env.DATABASE_URL} -F c -f ./backups/db-${backupId}.dump`

      exec(command, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(new Error(`Database backup failed: ${error.message}`))
        } else {
          resolve()
        }
      })
    })
  }

  private async backupStorage(backupId: string): Promise<void> {
    // Backup Supabase Storage buckets
    const { data: buckets } = await this.supabase.storage.listBuckets()

    for (const bucket of buckets || []) {
      const { data: files } = await this.supabase.storage
        .from(bucket.name)
        .list('', { limit: 1000 })

      // Download and backup each file
      for (const file of files || []) {
        await this.downloadAndBackupFile(bucket.name, file.name, backupId)
      }
    }
  }

  private async recordBackup(backupId: string, type: 'full' | 'incremental'): Promise<void> {
    await this.supabase.from('backup_logs').insert({
      backup_id: backupId,
      backup_type: type,
      status: 'completed',
      created_at: new Date().toISOString(),
      metadata: {
        databaseSize: await this.getDatabaseSize(),
        storageSize: await this.getStorageSize(),
        fileCount: await this.getFileCount()
      }
    })
  }

  private async getDatabaseSize(): Promise<number> {
    const { data } = await this.supabase.rpc('get_database_size')
    return data || 0
  }

  private async getStorageSize(): Promise<number> {
    const { data } = await this.supabase.rpc('get_storage_size')
    return data || 0
  }

  private async getFileCount(): Promise<number> {
    const { count } = await this.supabase
      .from('company_documents')
      .select('*', { count: 'exact', head: true })

    return count || 0
  }
}
```

### Point-in-Time Recovery

```sql
-- Create function for point-in-time recovery
CREATE OR REPLACE FUNCTION restore_to_point_in_time(
  p_target_timestamp timestamptz,
  p_backup_location text
) RETURNS boolean AS $$
DECLARE
  table_record record;
  backup_file text;
BEGIN
  -- Stop all writes during recovery
  -- This is a simplified version - in practice you'd need more sophisticated locking

  -- Restore each table from backup
  FOR table_record IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  LOOP
    backup_file := format('%s/%s_%s.backup',
      p_backup_location,
      table_record.table_name,
      to_char(p_target_timestamp, 'YYYYMMDD_HH24MI'));

    -- Restore table from backup file
    -- This would use pg_restore or similar tools
    PERFORM format('pg_restore -t %s -d $DB_NAME %s',
      table_record.table_name, backup_file);

  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Quality & Validation

### Data Validation Framework

```typescript
// lib/data-validation.ts
import { z } from 'zod'

export const EmployeeSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  role: z.enum(['employee', 'manager', 'admin', 'hr']),
  department: z.string().min(1).max(100),
  is_active: z.boolean().default(true)
})

export const LeaveRequestSchema = z.object({
  leave_type_id: z.string().uuid(),
  start_date: z.string().refine((date) => {
    const d = new Date(date)
    return d >= new Date() && d <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }, 'Start date must be between today and one year from now'),
  end_date: z.string(),
  reason: z.string().min(10).max(500).optional()
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate >= startDate
}, 'End date must be after or equal to start date')

export class DataValidator {
  static validateEmployee(data: unknown): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = EmployeeSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { success: false, errors: ['Unknown validation error'] }
    }
  }

  static validateLeaveRequest(data: unknown): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = LeaveRequestSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { success: false, errors: ['Unknown validation error'] }
    }
  }

  static async validateBusinessRules(leaveRequest: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Check if employee has sufficient balance
    const availableDays = await this.getAvailableLeaveDays(
      leaveRequest.requester_id,
      leaveRequest.leave_type_id
    )

    if (availableDays < leaveRequest.days_count) {
      errors.push(`Insufficient leave balance. Available: ${availableDays}, Requested: ${leaveRequest.days_count}`)
    }

    // Check for overlapping leaves
    const overlappingLeaves = await this.getOverlappingLeaves(
      leaveRequest.requester_id,
      leaveRequest.start_date,
      leaveRequest.end_date
    )

    if (overlappingLeaves.length > 0) {
      errors.push('Leave request overlaps with existing leave')
    }

    return { valid: errors.length === 0, errors }
  }

  private static async getAvailableLeaveDays(employeeId: string, leaveTypeId: string): Promise<number> {
    // Implementation to calculate available leave days
    return 0
  }

  private static async getOverlappingLeaves(employeeId: string, startDate: string, endDate: string): Promise<any[]> {
    // Implementation to check for overlapping leave requests
    return []
  }
}
```

### Data Quality Monitoring

```sql
-- Create data quality monitoring view
CREATE OR REPLACE VIEW data_quality_metrics AS
SELECT
  'employees' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE email IS NULL OR email = '') as missing_email,
  COUNT(*) FILTER (WHERE first_name IS NULL OR first_name = '') as missing_first_name,
  COUNT(*) FILTER (WHERE department IS NULL OR department = '') as missing_department,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_records,
  COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as recent_records
FROM public.employees

UNION ALL

SELECT
  'leaves' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE start_date IS NULL) as missing_start_date,
  COUNT(*) FILTER (WHERE end_date IS NULL) as missing_end_date,
  COUNT(*) FILTER (WHERE days_count <= 0) as invalid_days_count,
  COUNT(*) FILTER (WHERE status NOT IN ('pending', 'approved', 'rejected', 'cancelled')) as invalid_status,
  COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as recent_records
FROM public.leaves

UNION ALL

SELECT
  'company_documents' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE) as expired_documents,
  COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE + INTERVAL '30 days') as expiring_soon,
  COUNT(*) FILTER (WHERE storage_path IS NULL OR storage_path = '') as missing_storage_path,
  COUNT(*) FILTER (WHERE metadata IS NULL OR metadata = '{}') as missing_metadata,
  COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as recent_records
FROM public.company_documents;
```

## Data Archival

### Automated Archival System

```typescript
// lib/data-archival.ts
export interface ArchivalPolicy {
  tableName: string
  archiveAfterDays: number
  archiveStrategy: 'move' | 'copy' | 'compress'
  archiveLocation: 'cold_storage' | 'external_database' | 'file_system'
  retentionAfterArchival: number // days to keep in archive
}

export const archivalPolicies: ArchivalPolicy[] = [
  {
    tableName: 'audit_logs',
    archiveAfterDays: 365, // Archive after 1 year
    archiveStrategy: 'compress',
    archiveLocation: 'cold_storage',
    retentionAfterArchival: 2555 // Keep for 7 years total
  },
  {
    tableName: 'leaves',
    archiveAfterDays: 1825, // Archive after 5 years
    archiveStrategy: 'move',
    archiveLocation: 'external_database',
    retentionAfterArchival: 0 // Delete after archival
  }
]

export class DataArchivalSystem {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async processArchival(): Promise<void> {
    console.log('🏛️ Starting data archival process...')

    for (const policy of archivalPolicies) {
      await this.archiveTable(policy)
    }

    console.log('✅ Data archival completed')
  }

  private async archiveTable(policy: ArchivalPolicy): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - policy.archiveAfterDays)

    console.log(`📦 Archiving ${policy.tableName} records older than ${cutoffDate.toISOString()}`)

    // Get records to archive
    const { data: recordsToArchive } = await this.supabase
      .from(policy.tableName)
      .select('*')
      .lt('created_at', cutoffDate.toISOString())

    if (!recordsToArchive || recordsToArchive.length === 0) {
      console.log(`No records to archive for ${policy.tableName}`)
      return
    }

    // Archive based on strategy
    switch (policy.archiveStrategy) {
      case 'move':
        await this.moveToArchive(recordsToArchive, policy)
        break
      case 'copy':
        await this.copyToArchive(recordsToArchive, policy)
        break
      case 'compress':
        await this.compressAndArchive(recordsToArchive, policy)
        break
    }

    // Remove from main table after successful archival
    const idsToDelete = recordsToArchive.map(record => record.id)
    await this.supabase
      .from(policy.tableName)
      .delete()
      .in('id', idsToDelete)

    console.log(`✅ Archived ${recordsToArchive.length} records from ${policy.tableName}`)
  }

  private async moveToArchive(records: any[], policy: ArchivalPolicy): Promise<void> {
    // Move records to archive table
    const archiveTableName = `${policy.tableName}_archive`

    // Insert into archive table
    await this.supabase.from(archiveTableName).insert(records.map(record => ({
      ...record,
      archived_at: new Date().toISOString(),
      original_table: policy.tableName
    })))
  }

  private async copyToArchive(records: any[], policy: ArchivalPolicy): Promise<void> {
    // Copy records to archive location without deleting from main table
    await this.moveToArchive(records, policy)
  }

  private async compressAndArchive(records: any[], policy: ArchivalPolicy): Promise<void> {
    // Compress data and store in cold storage
    const compressedData = await this.compressData(records)

    await this.storeInColdStorage(compressedData, policy)
  }

  private async compressData(data: any[]): Promise<Buffer> {
    // Implement compression logic (gzip, etc.)
    return Buffer.from(JSON.stringify(data))
  }

  private async storeInColdStorage(data: Buffer, policy: ArchivalPolicy): Promise<void> {
    // Store compressed data in cold storage (S3, etc.)
    // Implementation depends on your cold storage solution
  }
}
```

## Data Access & Security

### Data Classification and Access Control

```typescript
// lib/data-security.ts
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export interface DataSecurityPolicy {
  tableName: string
  classification: DataClassification
  allowedRoles: string[]
  encryptionRequired: boolean
  auditRequired: boolean
  retentionDays: number
}

export const dataSecurityPolicies: DataSecurityPolicy[] = [
  {
    tableName: 'employees',
    classification: DataClassification.CONFIDENTIAL,
    allowedRoles: ['admin', 'hr'],
    encryptionRequired: true,
    auditRequired: true,
    retentionDays: 3650 // 10 years
  },
  {
    tableName: 'leaves',
    classification: DataClassification.INTERNAL,
    allowedRoles: ['employee', 'manager', 'admin', 'hr'],
    encryptionRequired: false,
    auditRequired: true,
    retentionDays: 1825 // 5 years
  },
  {
    tableName: 'company_documents',
    classification: DataClassification.RESTRICTED,
    allowedRoles: ['admin', 'hr'],
    encryptionRequired: true,
    auditRequired: true,
    retentionDays: 2555 // 7 years
  }
]

export class DataSecurityManager {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async validateDataAccess(
    userId: string,
    tableName: string,
    operation: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    // Get user role
    const { data: user } = await this.supabase
      .from('employees')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) return false

    // Find applicable security policy
    const policy = dataSecurityPolicies.find(p => p.tableName === tableName)
    if (!policy) return false

    // Check if user's role is allowed
    const hasRoleAccess = policy.allowedRoles.includes(user.role)
    if (!hasRoleAccess) return false

    // Additional checks based on operation
    if (operation === 'write' || operation === 'delete') {
      return this.validateWriteAccess(userId, tableName, policy)
    }

    return true
  }

  private async validateWriteAccess(
    userId: string,
    tableName: string,
    policy: DataSecurityPolicy
  ): Promise<boolean> {
    // Additional validation for write operations
    if (policy.classification === DataClassification.RESTRICTED) {
      // Only admins can modify restricted data
      const { data: user } = await this.supabase
        .from('employees')
        .select('role')
        .eq('id', userId)
        .single()

      return user?.role === 'admin'
    }

    return true
  }

  async logDataAccess(
    userId: string,
    tableName: string,
    operation: string,
    recordId?: string
  ): Promise<void> {
    const policy = dataSecurityPolicies.find(p => p.tableName === tableName)

    if (policy?.auditRequired) {
      await this.supabase.from('data_access_logs').insert({
        user_id: userId,
        table_name: tableName,
        operation,
        record_id: recordId,
        classification: policy.classification,
        created_at: new Date().toISOString()
      })
    }
  }
}
```

### Data Export Security

```typescript
// lib/data-export.ts
export interface ExportRequest {
  userId: string
  tableName: string
  filters?: Record<string, any>
  format: 'csv' | 'json' | 'xlsx'
  includePII: boolean
  reason: string
}

export class SecureDataExporter {
  private supabase: any
  private auditLogger: AuditLogger

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.auditLogger = new AuditLogger()
  }

  async processExportRequest(request: ExportRequest): Promise<string> {
    // Validate access permissions
    const hasAccess = await this.validateExportPermissions(request)
    if (!hasAccess) {
      throw new Error('Insufficient permissions for data export')
    }

    // Log export request
    await this.auditLogger.logEvent({
      userId: request.userId,
      action: 'DATA_EXPORT',
      tableName: request.tableName,
      metadata: {
        format: request.format,
        includePII: request.includePII,
        reason: request.reason,
        filters: request.filters
      }
    })

    // Generate secure export
    const exportId = await this.generateSecureExport(request)

    // Create time-limited signed URL
    const signedUrl = await this.createSignedExportUrl(exportId)

    return signedUrl
  }

  private async validateExportPermissions(request: ExportRequest): Promise<boolean> {
    // Check if user has permission to export from this table
    const { data: user } = await this.supabase
      .from('employees')
      .select('role')
      .eq('id', request.userId)
      .single()

    if (!user) return false

    // Define export permissions by role
    const exportPermissions: Record<string, string[]> = {
      admin: ['employees', 'leaves', 'leave_balances', 'company_documents', 'audit_logs'],
      hr: ['employees', 'leaves', 'leave_balances', 'company_documents'],
      manager: ['leaves'],
      employee: []
    }

    const allowedTables = exportPermissions[user.role] || []
    return allowedTables.includes(request.tableName)
  }

  private async generateSecureExport(request: ExportRequest): Promise<string> {
    // Generate export data with appropriate filtering
    let query = this.supabase.from(request.tableName).select('*')

    // Apply filters
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    // Remove PII if not authorized
    if (!request.includePII) {
      query = this.removePIIFields(query, request.tableName)
    }

    const { data } = await query

    // Generate unique export ID
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Store export data temporarily (encrypted)
    await this.storeExportData(exportId, data, request)

    return exportId
  }

  private removePIIFields(query: any, tableName: string): any {
    const piiFields: Record<string, string[]> = {
      employees: ['email', 'first_name', 'last_name'],
      leaves: ['reason'],
      company_documents: ['uploaded_by']
    }

    const fieldsToExclude = piiFields[tableName] || []

    // This is a simplified implementation
    // In practice, you'd need to modify the select clause
    return query
  }

  private async storeExportData(
    exportId: string,
    data: any,
    request: ExportRequest
  ): Promise<void> {
    // Encrypt and store export data
    const encryptedData = await this.encryptData(data)

    await this.supabase.from('data_exports').insert({
      export_id: exportId,
      user_id: request.userId,
      table_name: request.tableName,
      format: request.format,
      encrypted_data: encryptedData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      created_at: new Date().toISOString()
    })
  }

  private async createSignedExportUrl(exportId: string): Promise<string> {
    // Create signed URL for secure download
    const { data } = await this.supabase.storage
      .from('exports')
      .createSignedUrl(`${exportId}.json`, 3600) // 1 hour expiry

    return data?.signedUrl || ''
  }

  private async encryptData(data: any): Promise<string> {
    // Implement encryption using your preferred method
    // This is a placeholder
    return JSON.stringify(data)
  }
}
```

## Data Management Scripts

### Database Health Check

```bash
#!/bin/bash
# scripts/db-health-check.sh

echo "🔍 Running database health checks..."

# Check connection
echo "Checking database connection..."
npm run db:ping || { echo "❌ Database connection failed"; exit 1; }

# Check table existence
echo "Checking required tables..."
REQUIRED_TABLES=("employees" "leaves" "leave_types" "leave_balances" "company_documents" "audit_logs")

for table in "${REQUIRED_TABLES[@]}"; do
  npm run db:table-exists $table || { echo "❌ Table $table missing"; exit 1; }
done

# Check RLS status
echo "Checking RLS status..."
npm run db:rls-status || { echo "❌ RLS check failed"; exit 1; }

# Check indexes
echo "Checking indexes..."
npm run db:index-status || { echo "❌ Index check failed"; exit 1; }

# Check data quality
echo "Checking data quality..."
npm run db:data-quality || { echo "❌ Data quality check failed"; exit 1; }

echo "✅ All database health checks passed!"
```

### Data Cleanup Scripts

```typescript
// scripts/data-cleanup.ts
export async function runDataCleanup(): Promise<void> {
  console.log('🧹 Starting data cleanup process...')

  // Clean up orphaned records
  await cleanupOrphanedRecords()

  // Remove duplicate records
  await removeDuplicateRecords()

  // Update calculated fields
  await updateCalculatedFields()

  // Validate data integrity
  await validateDataIntegrity()

  console.log('✅ Data cleanup completed')
}

async function cleanupOrphanedRecords(): Promise<void> {
  // Remove leave balances for non-existent employees
  const { error } = await supabase
    .from('leave_balances')
    .delete()
    .notIn('employee_id',
      supabase.from('employees').select('id')
    )

  if (error) {
    console.error('Failed to cleanup orphaned leave balances:', error)
  }
}

async function removeDuplicateRecords(): Promise<void> {
  // Remove duplicate leave balances (keep the most recent)
  const { data: duplicates } = await supabase
    .rpc('find_duplicate_leave_balances')

  for (const duplicate of duplicates || []) {
    await supabase
      .from('leave_balances')
      .delete()
      .eq('id', duplicate.id_to_delete)
  }
}

async function updateCalculatedFields(): Promise<void> {
  // Recalculate leave days count
  const { data: leaves } = await supabase
    .from('leaves')
    .select('id, start_date, end_date')
    .is('days_count', null)

  for (const leave of leaves || []) {
    const daysCount = calculateBusinessDays(leave.start_date, leave.end_date)

    await supabase
      .from('leaves')
      .update({ days_count: daysCount })
      .eq('id', leave.id)
  }
}

function calculateBusinessDays(startDate: string, endDate: string): number {
  // Implementation to calculate business days excluding weekends
  return 0
}
```

## Data Management Checklist

- [ ] Database migrations validated and tested
- [ ] RLS policies properly configured
- [ ] Data retention policies implemented
- [ ] GDPR compliance measures in place
- [ ] Audit logging configured for all sensitive operations
- [ ] Backup strategy tested and verified
- [ ] Data quality validation rules implemented
- [ ] Archival policies configured
- [ ] Data access permissions properly set
- [ ] Export security measures implemented
- [ ] Data cleanup scripts scheduled
- [ ] Compliance monitoring active

## Emergency Data Procedures

```typescript
// lib/emergency-data-procedures.ts
export async function handleDataEmergency(
  emergencyType: 'breach' | 'loss' | 'corruption' | 'unauthorized_access'
): Promise<void> {
  switch (emergencyType) {
    case 'breach':
      await handleDataBreach()
      break
    case 'loss':
      await handleDataLoss()
      break
    case 'corruption':
      await handleDataCorruption()
      break
    case 'unauthorized_access':
      await handleUnauthorizedAccess()
      break
  }
}

async function handleDataBreach(): Promise<void> {
  // 1. Isolate affected systems
  await isolateSystems()

  // 2. Assess breach scope
  await assessBreachScope()

  // 3. Notify affected users
  await notifyAffectedUsers()

  // 4. Report to authorities if required
  await reportToAuthorities()

  // 5. Implement remediation measures
  await implementRemediation()
}

async function handleDataLoss(): Promise<void> {
  // 1. Verify backup integrity
  await verifyBackupIntegrity()

  // 2. Restore from backup
  await restoreFromBackup()

  // 3. Verify data integrity
  await verifyRestoredData()

  // 4. Notify stakeholders
  await notifyStakeholders()
}
