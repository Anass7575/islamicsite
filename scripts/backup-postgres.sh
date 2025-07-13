#!/bin/bash
#
# PostgreSQL Backup Script for Al-Hidaya Platform
# Performs daily backups with rotation and compression
#

# Configuration
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="al-hidaya-db"
DB_NAME="${POSTGRES_DB:-alhidaya_db}"
DB_USER="${POSTGRES_USER:-alhidaya}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="alhidaya_backup_${TIMESTAMP}"

# Retention settings
DAILY_RETENTION=7
WEEKLY_RETENTION=4
MONTHLY_RETENTION=12

# Email settings (optional)
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
SMTP_SERVER="${SMTP_SERVER:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Error handling
error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    
    # Send email notification if configured
    if [ -n "$ADMIN_EMAIL" ] && [ -n "$SMTP_SERVER" ]; then
        echo "Backup failed: $1" | mail -s "Al-Hidaya Backup Failed" "$ADMIN_EMAIL"
    fi
    
    exit 1
}

# Success notification
success_notification() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    
    # Send success email if configured
    if [ -n "$ADMIN_EMAIL" ] && [ -n "$SMTP_SERVER" ]; then
        echo "$1" | mail -s "Al-Hidaya Backup Successful" "$ADMIN_EMAIL"
    fi
}

# Create backup directories if they don't exist
create_backup_dirs() {
    log "Creating backup directories..."
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly,temp} || error_exit "Failed to create backup directories"
}

# Check if PostgreSQL container is running
check_postgres() {
    log "Checking PostgreSQL container status..."
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error_exit "PostgreSQL container '$CONTAINER_NAME' is not running"
    fi
}

# Perform the backup
perform_backup() {
    log "Starting backup of database '$DB_NAME'..."
    
    # Create SQL dump
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-privileges \
        --format=custom \
        --file="/tmp/${BACKUP_NAME}.dump" \
        2>&1 | while read line; do
            log "  $line"
        done
    
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        error_exit "pg_dump failed"
    fi
    
    # Copy dump from container to host
    log "Copying backup to host..."
    docker cp "$CONTAINER_NAME:/tmp/${BACKUP_NAME}.dump" "$BACKUP_DIR/temp/" || error_exit "Failed to copy backup from container"
    
    # Compress the backup
    log "Compressing backup..."
    gzip -9 "$BACKUP_DIR/temp/${BACKUP_NAME}.dump" || error_exit "Failed to compress backup"
    
    # Move to daily backups
    mv "$BACKUP_DIR/temp/${BACKUP_NAME}.dump.gz" "$BACKUP_DIR/daily/" || error_exit "Failed to move backup to daily directory"
    
    # Clean up temp file in container
    docker exec "$CONTAINER_NAME" rm -f "/tmp/${BACKUP_NAME}.dump"
    
    # Get backup size
    BACKUP_SIZE=$(ls -lh "$BACKUP_DIR/daily/${BACKUP_NAME}.dump.gz" | awk '{print $5}')
    log "Backup completed successfully. Size: $BACKUP_SIZE"
}

# Rotate daily backups
rotate_daily_backups() {
    log "Rotating daily backups (keeping last $DAILY_RETENTION)..."
    
    cd "$BACKUP_DIR/daily"
    ls -t alhidaya_backup_*.dump.gz 2>/dev/null | tail -n +$((DAILY_RETENTION + 1)) | xargs -r rm -f
}

# Promote to weekly backup
promote_weekly() {
    # Run on Sundays
    if [ $(date +%w) -eq 0 ]; then
        log "Promoting latest daily backup to weekly..."
        
        LATEST_DAILY=$(ls -t "$BACKUP_DIR/daily"/alhidaya_backup_*.dump.gz 2>/dev/null | head -1)
        if [ -n "$LATEST_DAILY" ]; then
            cp "$LATEST_DAILY" "$BACKUP_DIR/weekly/$(basename $LATEST_DAILY)"
            
            # Rotate weekly backups
            cd "$BACKUP_DIR/weekly"
            ls -t alhidaya_backup_*.dump.gz 2>/dev/null | tail -n +$((WEEKLY_RETENTION + 1)) | xargs -r rm -f
        fi
    fi
}

# Promote to monthly backup
promote_monthly() {
    # Run on the 1st of each month
    if [ $(date +%d) -eq 01 ]; then
        log "Promoting latest weekly backup to monthly..."
        
        LATEST_WEEKLY=$(ls -t "$BACKUP_DIR/weekly"/alhidaya_backup_*.dump.gz 2>/dev/null | head -1)
        if [ -n "$LATEST_WEEKLY" ]; then
            cp "$LATEST_WEEKLY" "$BACKUP_DIR/monthly/$(basename $LATEST_WEEKLY)"
            
            # Rotate monthly backups
            cd "$BACKUP_DIR/monthly"
            ls -t alhidaya_backup_*.dump.gz 2>/dev/null | tail -n +$((MONTHLY_RETENTION + 1)) | xargs -r rm -f
        fi
    fi
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR/daily"/alhidaya_backup_*.dump.gz | head -1)
    
    # Test if file can be uncompressed
    if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
        log "Backup integrity check passed"
    else
        error_exit "Backup integrity check failed"
    fi
}

# Generate backup report
generate_report() {
    log "Generating backup report..."
    
    REPORT_FILE="$BACKUP_DIR/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "Al-Hidaya PostgreSQL Backup Report"
        echo "=================================="
        echo "Date: $(date)"
        echo "Database: $DB_NAME"
        echo "Container: $CONTAINER_NAME"
        echo ""
        echo "Backup Statistics:"
        echo "------------------"
        echo "Daily backups: $(ls -1 "$BACKUP_DIR/daily" 2>/dev/null | wc -l)"
        echo "Weekly backups: $(ls -1 "$BACKUP_DIR/weekly" 2>/dev/null | wc -l)"
        echo "Monthly backups: $(ls -1 "$BACKUP_DIR/monthly" 2>/dev/null | wc -l)"
        echo ""
        echo "Storage Usage:"
        echo "--------------"
        du -sh "$BACKUP_DIR"/*/ 2>/dev/null
        echo ""
        echo "Latest Backups:"
        echo "---------------"
        echo "Daily: $(ls -t "$BACKUP_DIR/daily" | head -1)"
        echo "Weekly: $(ls -t "$BACKUP_DIR/weekly" | head -1)"
        echo "Monthly: $(ls -t "$BACKUP_DIR/monthly" | head -1)"
    } > "$REPORT_FILE"
    
    cat "$REPORT_FILE"
}

# Main execution
main() {
    log "Starting Al-Hidaya PostgreSQL backup process..."
    
    # Create backup directories
    create_backup_dirs
    
    # Check PostgreSQL status
    check_postgres
    
    # Perform backup
    perform_backup
    
    # Rotate backups
    rotate_daily_backups
    promote_weekly
    promote_monthly
    
    # Verify backup
    verify_backup
    
    # Generate report
    generate_report
    
    success_notification "Backup completed successfully for $DB_NAME"
}

# Lock file to prevent concurrent runs
LOCK_FILE="/tmp/alhidaya_backup.lock"

# Check if another backup is running
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        log "Another backup process is already running (PID: $PID)"
        exit 0
    else
        log "Removing stale lock file"
        rm -f "$LOCK_FILE"
    fi
fi

# Create lock file
echo $$ > "$LOCK_FILE"

# Ensure lock file is removed on exit
trap "rm -f $LOCK_FILE" EXIT

# Run main function
main

log "Backup process completed"