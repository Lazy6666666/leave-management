#!/bin/bash

# Deployment script for Leave Management System
# Usage: ./deploy.sh [environment] [version]

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
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

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI is not installed"
        exit 1
    fi
    
    success "All dependencies are installed"
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
    
    # Validate required variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_PROJECT_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    success "Environment variables loaded"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "${PROJECT_ROOT}/backend"
    
    # Check for pending migrations
    pending=$(supabase db pending --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null || echo "0")
    
    if [ "$pending" != "0" ]; then
        log "Found $pending pending migrations"
        
        # Apply migrations
        if supabase db push --project-ref "$SUPABASE_PROJECT_ID"; then
            success "Database migrations applied successfully"
        else
            error "Failed to apply database migrations"
            exit 1
        fi
    else
        log "No pending migrations found"
    fi
}

# Deploy edge functions
deploy_edge_functions() {
    log "Deploying edge functions..."
    
    cd "${PROJECT_ROOT}/backend"
    
    # Get list of edge functions
    functions=$(supabase functions list --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null || echo "")
    
    # Deploy each function
    for func_dir in functions/*/; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            log "Deploying edge function: $func_name"
            
            if supabase functions deploy "$func_name" --project-ref "$SUPABASE_PROJECT_ID"; then
                success "Edge function $func_name deployed successfully"
            else
                error "Failed to deploy edge function $func_name"
                exit 1
            fi
        fi
    done
}

# Build frontend application
build_frontend() {
    log "Building frontend application..."
    
    cd "${PROJECT_ROOT}/frontend"
    
    # Clean previous build
    rm -rf .next out
    
    # Install dependencies
    if npm ci; then
        success "Dependencies installed successfully"
    else
        error "Failed to install dependencies"
        exit 1
    fi
    
    # Run build
    if npm run build; then
        success "Frontend built successfully"
    else
        error "Failed to build frontend"
        exit 1
    fi
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    cd "${PROJECT_ROOT}/frontend"
    
    # Start the application
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Health check passed"
    else
        error "Health check failed"
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop the application
    kill $APP_PID 2>/dev/null || true
}

# Run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    cd "${PROJECT_ROOT}/frontend"
    
    if npm run test:smoke; then
        success "Smoke tests passed"
    else
        error "Smoke tests failed"
        exit 1
    fi
}

# Create backup
create_backup() {
    log "Creating backup before deployment..."
    
    BACKUP_DIR="${PROJECT_ROOT}/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if supabase db dump --project-ref "$SUPABASE_PROJECT_ID" > "$BACKUP_DIR/database.sql"; then
        success "Database backup created"
    else
        warning "Failed to create database backup"
    fi
    
    # Backup storage
    # This would require additional setup for storage backup
    
    success "Backup created at $BACKUP_DIR"
}

# Rollback function
rollback() {
    error "Deployment failed. Initiating rollback..."
    
    # Restore database from backup
    if [ -n "$BACKUP_DIR" ] && [ -f "$BACKUP_DIR/database.sql" ]; then
        log "Restoring database from backup..."
        # This would restore the database
        warning "Database rollback would be performed here"
    fi
    
    # Rollback edge functions
    log "Rolling back edge functions..."
    # This would restore previous versions
    warning "Edge function rollback would be performed here"
    
    exit 1
}

# Deployment summary
show_deployment_summary() {
    log "Deployment Summary"
    echo "===================="
    echo "Environment: $ENVIRONMENT"
    echo "Version: $VERSION"
    echo "Timestamp: $(date)"
    echo "Status: SUCCESS"
    echo "===================="
}

# Main deployment function
main() {
    log "Starting deployment to $ENVIRONMENT environment..."
    
    # Set up error handling
    trap rollback ERR
    
    # Run deployment steps
    check_dependencies
    load_env
    create_backup
    run_migrations
    deploy_edge_functions
    build_frontend
    health_check
    run_smoke_tests
    
    # Show deployment summary
    show_deployment_summary
    
    success "Deployment completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [version]"
        echo "Environments: staging, production"
        echo "Version: optional, defaults to 'latest'"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        main
        ;;
esac