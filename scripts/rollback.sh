#!/bin/bash

# Rollback script for Leave Management System
# Usage: ./rollback.sh [environment] [backup_timestamp]

set -e

ENVIRONMENT=${1:-staging}
BACKUP_TIMESTAMP=${2:-}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Load environment variables
load_env() {
    log "Loading environment variables for $ENVIRONMENT..."
    
    ENV_FILE="${PROJECT_ROOT}/.env.${ENVIRONMENT}"
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
        exit 1
    fi
    
    # Export environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    success "Environment variables loaded"
}

# List available backups
list_backups() {
    log "Available backups:"
    
    BACKUP_DIR="${PROJECT_ROOT}/backups"
    if [ ! -d "$BACKUP_DIR" ]; then
        warning "No backup directory found"
        return 1
    fi
    
    find "$BACKUP_DIR" -name "*.sql" -type f | sort -r | head -10 | while read -r backup; do
        backup_name=$(basename "$backup" .sql)
        backup_date=$(echo "$backup_name" | cut -d'_' -f1-2)
        echo "  $backup_date - $backup"
    done
}

# Find backup file
find_backup() {
    local timestamp=$1
    BACKUP_DIR="${PROJECT_ROOT}/backups"
    
    if [ -n "$timestamp" ]; then
        # Look for specific timestamp
        BACKUP_FILE="${BACKUP_DIR}/${timestamp}/database.sql"
        if [ -f "$BACKUP_FILE" ]; then
            echo "$BACKUP_FILE"
            return 0
        fi
    fi
    
    # Find most recent backup
    find "$BACKUP_DIR" -name "database.sql" -type f | sort -r | head -1
}

# Restore database
restore_database() {
    local backup_file=$1
    
    log "Restoring database from $backup_file..."
    
    # Create temporary restore script
    TEMP_RESTORE="/tmp/restore_$$.sql"
    
    cat > "$TEMP_RESTORE" << EOF
-- Disable triggers temporarily
SET session_replication_role = replica;

-- Drop existing data (be careful!)
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END \$\$;

-- Restore data
\i $backup_file

-- Re-enable triggers
SET session_replication_role = origin;
EOF
    
    # Execute restore
    if PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql -h "$SUPABASE_PROJECT_ID.supabase.co" -U postgres -d postgres -f "$TEMP_RESTORE"; then
        success "Database restored successfully"
    else
        error "Failed to restore database"
        rm -f "$TEMP_RESTORE"
        exit 1
    fi
    
    rm -f "$TEMP_RESTORE"
}

# Restore edge functions
restore_edge_functions() {
    log "Restoring edge functions..."
    
    cd "${PROJECT_ROOT}/backend"
    
    # Get list of current functions
    current_functions=$(supabase functions list --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null || echo "")
    
    # Delete all existing functions
    echo "$current_functions" | while read -r func_name; do
        if [ -n "$func_name" ]; then
            log "Deleting edge function: $func_name"
            supabase functions delete "$func_name" --project-ref "$SUPABASE_PROJECT_ID" || true
        fi
    done
    
    # Deploy functions from backup
    if [ -d "${PROJECT_ROOT}/backups/${BACKUP_TIMESTAMP}/functions" ]; then
        cp -r "${PROJECT_ROOT}/backups/${BACKUP_TIMESTAMP}/functions/"* functions/ 2>/dev/null || true
    fi
    
    # Redeploy all functions
    for func_dir in functions/*/; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            log "Redeploying edge function: $func_name"
            
            if supabase functions deploy "$func_name" --project-ref "$SUPABASE_PROJECT_ID"; then
                success "Edge function $func_name restored successfully"
            else
                warning "Failed to restore edge function $func_name"
            fi
        fi
    done
}

# Restore storage
restore_storage() {
    log "Restoring storage configuration..."
    
    # This would restore storage buckets and policies
    # Implementation depends on specific backup strategy
    warning "Storage restoration not implemented - manual intervention required"
}

# Verify rollback
verify_rollback() {
    log "Verifying rollback..."
    
    # Check database connectivity
    if PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql -h "$SUPABASE_PROJECT_ID.supabase.co" -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        success "Database connectivity verified"
    else
        error "Database connectivity check failed"
        return 1
    fi
    
    # Check edge functions
    functions_count=$(supabase functions list --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null | wc -l)
    log "Found $functions_count edge functions deployed"
    
    # Run basic health checks
    cd "${PROJECT_ROOT}/frontend"
    
    if npm run health:check; then
        success "Health checks passed"
    else
        warning "Some health checks failed"
    fi
    
    success "Rollback verification completed"
}

# Create rollback report
create_rollback_report() {
    local backup_timestamp=$1
    local status=$2
    
    REPORT_FILE="${PROJECT_ROOT}/rollback_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
Rollback Report
===============
Timestamp: $(date)
Environment: $ENVIRONMENT
Backup Used: $backup_timestamp
Status: $status

Actions Taken:
- Database restored from backup
- Edge functions redeployed
- Storage configuration restored (if applicable)
- Health checks performed

Recommendations:
- Monitor application logs for errors
- Verify critical functionality
- Check data integrity
- Notify stakeholders of rollback completion

Next Steps:
- Investigate root cause of deployment failure
- Fix identified issues
- Plan next deployment attempt
- Update deployment procedures if needed
EOF
    
    log "Rollback report created: $REPORT_FILE"
}

# Main rollback function
main() {
    log "Starting rollback for $ENVIRONMENT environment..."
    
    # Validate backup timestamp
    if [ -z "$BACKUP_TIMESTAMP" ]; then
        log "No backup timestamp provided, finding most recent backup..."
        BACKUP_FILE=$(find_backup "")
        if [ -n "$BACKUP_FILE" ]; then
            BACKUP_TIMESTAMP=$(basename "$(dirname "$BACKUP_FILE")")
            log "Using most recent backup: $BACKUP_TIMESTAMP"
        else
            error "No backup found"
            exit 1
        fi
    fi
    
    # Load environment
    load_env
    
    # Find backup file
    BACKUP_FILE=$(find_backup "$BACKUP_TIMESTAMP")
    if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found for timestamp: $BACKUP_TIMESTAMP"
        list_backups
        exit 1
    fi
    
    log "Using backup file: $BACKUP_FILE"
    
    # Confirm rollback
    read -p "Are you sure you want to rollback to backup $BACKUP_TIMESTAMP? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log "Rollback cancelled by user"
        exit 0
    fi
    
    # Execute rollback
    restore_database "$BACKUP_FILE"
    restore_edge_functions
    restore_storage
    
    # Verify rollback
    if verify_rollback; then
        success "Rollback completed successfully"
        create_rollback_report "$BACKUP_TIMESTAMP" "SUCCESS"
    else
        error "Rollback verification failed"
        create_rollback_report "$BACKUP_TIMESTAMP" "PARTIAL_SUCCESS"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [backup_timestamp]"
        echo "Environments: staging, production"
        echo "backup_timestamp: optional, defaults to most recent backup"
        echo ""
        echo "Available backups:"
        list_backups
        exit 0
        ;;
    "list"|"-l"|"--list")
        list_backups
        exit 0
        ;;
    "")
        main
        ;;
    *)
        main
        ;;
esac