#!/bin/bash
#
# PostgreSQL Restore Script for Al-Hidaya Platform
# Restores database from backup files
#

# Configuration
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="al-hidaya-db"
DB_NAME="${POSTGRES_DB:-alhidaya_db}"
DB_USER="${POSTGRES_USER:-alhidaya}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Error handling
error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Info message
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -f, --file BACKUP_FILE    Specific backup file to restore
    -l, --list               List available backups
    -d, --date DATE          Restore backup from specific date (YYYYMMDD)
    -t, --type TYPE          Backup type: daily, weekly, or monthly (default: daily)
    --force                  Skip confirmation prompt
    -h, --help              Show this help message

Examples:
    $0 -l                                    # List all backups
    $0 -f alhidaya_backup_20240101_020000.dump.gz  # Restore specific file
    $0 -d 20240101                          # Restore from date
    $0 -t weekly                            # Restore latest weekly backup

EOF
    exit 0
}

# List available backups
list_backups() {
    info "Available backups:"
    echo ""
    
    for type in daily weekly monthly; do
        echo -e "${BLUE}${type^} Backups:${NC}"
        if [ -d "$BACKUP_DIR/$type" ]; then
            ls -lhtr "$BACKUP_DIR/$type" | grep "alhidaya_backup_" | tail -10
        else
            echo "  No $type backups found"
        fi
        echo ""
    done
}

# Find backup by date
find_backup_by_date() {
    local date=$1
    local type=${2:-daily}
    
    log "Searching for backup from date: $date (type: $type)"
    
    local backup_file=$(ls -1 "$BACKUP_DIR/$type"/alhidaya_backup_${date}*.dump.gz 2>/dev/null | tail -1)
    
    if [ -z "$backup_file" ]; then
        error_exit "No backup found for date $date in $type backups"
    fi
    
    echo "$backup_file"
}

# Get latest backup
get_latest_backup() {
    local type=${1:-daily}
    
    log "Getting latest $type backup..."
    
    local backup_file=$(ls -t "$BACKUP_DIR/$type"/alhidaya_backup_*.dump.gz 2>/dev/null | head -1)
    
    if [ -z "$backup_file" ]; then
        error_exit "No $type backups found"
    fi
    
    echo "$backup_file"
}

# Check if PostgreSQL is running
check_postgres() {
    log "Checking PostgreSQL container status..."
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error_exit "PostgreSQL container '$CONTAINER_NAME' is not running"
    fi
}

# Create restore point
create_restore_point() {
    local restore_point_name="pre_restore_$(date +%Y%m%d_%H%M%S)"
    
    info "Creating restore point: $restore_point_name"
    
    # Backup current database before restore
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --format=custom \
        --file="/tmp/$restore_point_name.dump" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        docker cp "$CONTAINER_NAME:/tmp/$restore_point_name.dump" "$BACKUP_DIR/restore_points/" 2>/dev/null
        mkdir -p "$BACKUP_DIR/restore_points"
        docker cp "$CONTAINER_NAME:/tmp/$restore_point_name.dump" "$BACKUP_DIR/restore_points/"
        docker exec "$CONTAINER_NAME" rm -f "/tmp/$restore_point_name.dump"
        success "Restore point created: $restore_point_name"
    else
        warning "Failed to create restore point (database might be empty)"
    fi
}

# Restore database
restore_database() {
    local backup_file=$1
    local temp_file="/tmp/$(basename ${backup_file%.gz})"
    
    log "Starting database restore from: $(basename $backup_file)"
    
    # Extract backup info
    local backup_size=$(ls -lh "$backup_file" | awk '{print $5}')
    local backup_date=$(basename "$backup_file" | grep -oP '\d{8}_\d{6}')
    
    info "Backup details:"
    echo "  File: $(basename $backup_file)"
    echo "  Size: $backup_size"
    echo "  Date: $backup_date"
    echo ""
    
    # Confirmation prompt (unless --force is used)
    if [ "$FORCE_RESTORE" != "true" ]; then
        warning "This will REPLACE the current database with the backup!"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            info "Restore cancelled"
            exit 0
        fi
    fi
    
    # Create restore point
    create_restore_point
    
    # Copy and decompress backup
    log "Decompressing backup..."
    gunzip -c "$backup_file" > "$temp_file" || error_exit "Failed to decompress backup"
    
    # Copy to container
    log "Copying backup to container..."
    docker cp "$temp_file" "$CONTAINER_NAME:/tmp/restore.dump" || error_exit "Failed to copy backup to container"
    
    # Drop existing connections
    log "Disconnecting existing database connections..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null
    
    # Drop and recreate database
    log "Recreating database..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || warning "Failed to drop database (might not exist)"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" || error_exit "Failed to create database"
    
    # Restore the backup
    log "Restoring backup data..."
    docker exec "$CONTAINER_NAME" pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --verbose \
        "/tmp/restore.dump" 2>&1 | while read line; do
            log "  $line"
        done
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        success "Database restored successfully!"
    else
        error_exit "Restore failed! Check logs for details"
    fi
    
    # Cleanup
    rm -f "$temp_file"
    docker exec "$CONTAINER_NAME" rm -f "/tmp/restore.dump"
    
    # Run post-restore tasks
    post_restore_tasks
}

# Post-restore tasks
post_restore_tasks() {
    log "Running post-restore tasks..."
    
    # Analyze database for query optimization
    info "Analyzing database..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE;" 2>/dev/null
    
    # Reindex for better performance
    info "Reindexing database..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "REINDEX DATABASE $DB_NAME;" 2>/dev/null
    
    # Show database statistics
    info "Database statistics:"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT schemaname, tablename, n_live_tup as rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10;" 2>/dev/null
    
    success "Post-restore tasks completed"
}

# Main function
main() {
    local backup_file=""
    local backup_type="daily"
    local list_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                backup_file="$2"
                shift 2
                ;;
            -l|--list)
                list_only=true
                shift
                ;;
            -d|--date)
                backup_date="$2"
                shift 2
                ;;
            -t|--type)
                backup_type="$2"
                shift 2
                ;;
            --force)
                FORCE_RESTORE=true
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done
    
    # List backups if requested
    if [ "$list_only" = true ]; then
        list_backups
        exit 0
    fi
    
    # Check prerequisites
    check_postgres
    
    # Determine backup file to restore
    if [ -n "$backup_file" ]; then
        # Specific file provided
        if [[ ! "$backup_file" =~ ^/ ]]; then
            # Relative path - search in backup directories
            for dir in daily weekly monthly; do
                if [ -f "$BACKUP_DIR/$dir/$backup_file" ]; then
                    backup_file="$BACKUP_DIR/$dir/$backup_file"
                    break
                fi
            done
        fi
        
        if [ ! -f "$backup_file" ]; then
            error_exit "Backup file not found: $backup_file"
        fi
    elif [ -n "$backup_date" ]; then
        # Find backup by date
        backup_file=$(find_backup_by_date "$backup_date" "$backup_type")
    else
        # Get latest backup
        backup_file=$(get_latest_backup "$backup_type")
    fi
    
    # Perform restore
    restore_database "$backup_file"
}

# Lock file to prevent concurrent runs
LOCK_FILE="/tmp/alhidaya_restore.lock"

# Check if another restore is running
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        error_exit "Another restore process is already running (PID: $PID)"
    else
        rm -f "$LOCK_FILE"
    fi
fi

# Create lock file
echo $$ > "$LOCK_FILE"

# Ensure lock file is removed on exit
trap "rm -f $LOCK_FILE" EXIT

# Run main function
main "$@"