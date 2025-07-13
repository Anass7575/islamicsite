# 📦 PostgreSQL Backup & Restore Guide - Al-Hidaya Platform

## Overview

This guide covers the backup and restore procedures for the Al-Hidaya platform's PostgreSQL database. The system is configured for automated daily backups with weekly and monthly retention policies.

## 🔧 Backup Configuration

### Automated Backup Schedule
- **Daily Backups**: Every day at 2:00 AM (server time)
- **Weekly Backups**: Promoted from daily backups every Sunday
- **Monthly Backups**: Promoted from weekly backups on the 1st of each month

### Retention Policy
- **Daily**: Last 7 backups
- **Weekly**: Last 4 backups  
- **Monthly**: Last 12 backups

### Storage Locations
```
/backups/postgres/
├── daily/      # Daily backups
├── weekly/     # Weekly backups
├── monthly/    # Monthly backups
├── temp/       # Temporary files
└── restore_points/  # Pre-restore snapshots
```

## 🚀 Quick Start

### Start Backup Service
```bash
# Start the backup service (runs automatically)
docker-compose up -d backup

# Check backup service logs
docker logs -f al-hidaya-backup
```

### Manual Backup
```bash
# Run backup manually
docker exec al-hidaya-backup /scripts/backup-postgres.sh

# Or from host
./scripts/backup-postgres.sh
```

### List Available Backups
```bash
./scripts/restore-postgres.sh --list
```

### Restore Latest Backup
```bash
# Restore latest daily backup
./scripts/restore-postgres.sh

# Restore latest weekly backup
./scripts/restore-postgres.sh --type weekly
```

## 📋 Backup Operations

### 1. Manual Backup Execution

```bash
# Basic backup
./scripts/backup-postgres.sh

# With custom environment variables
POSTGRES_DB=custom_db POSTGRES_USER=custom_user ./scripts/backup-postgres.sh
```

### 2. Backup Verification

```bash
# Check backup integrity
gzip -t /backups/postgres/daily/alhidaya_backup_*.dump.gz

# View backup contents (metadata only)
pg_restore -l /backups/postgres/daily/alhidaya_backup_20240101_020000.dump
```

### 3. Backup Monitoring

```bash
# View backup report
cat /backups/postgres/backup_report_*.txt

# Check backup sizes
du -sh /backups/postgres/*/

# Monitor backup process
tail -f /var/log/backup.log
```

## 🔄 Restore Operations

### 1. Restore Specific Backup

```bash
# By filename
./scripts/restore-postgres.sh --file alhidaya_backup_20240101_020000.dump.gz

# By date (YYYYMMDD format)
./scripts/restore-postgres.sh --date 20240101

# Force restore without confirmation
./scripts/restore-postgres.sh --force
```

### 2. Restore from Different Backup Types

```bash
# Restore from weekly backup
./scripts/restore-postgres.sh --type weekly

# Restore from monthly backup
./scripts/restore-postgres.sh --type monthly

# Restore specific weekly backup by date
./scripts/restore-postgres.sh --date 20240101 --type weekly
```

### 3. Pre-Restore Safety

The restore script automatically:
- Creates a restore point before any restore operation
- Stores it in `/backups/postgres/restore_points/`
- Names it with timestamp: `pre_restore_YYYYMMDD_HHMMSS.dump`

To restore a pre-restore snapshot:
```bash
./scripts/restore-postgres.sh --file restore_points/pre_restore_20240101_120000.dump
```

## 🛠️ Advanced Operations

### Custom Backup Location

```bash
# Backup to custom location
BACKUP_DIR=/custom/backup/path ./scripts/backup-postgres.sh
```

### Backup Specific Tables

```bash
# Backup only hadith-related tables
docker exec al-hidaya-db pg_dump \
  -U alhidaya \
  -d alhidaya_db \
  -t hadiths \
  -t hadith_collections \
  -t hadith_books \
  --format=custom \
  --file=/tmp/hadith_backup.dump
```

### Incremental Backups (Using WAL)

```bash
# Enable WAL archiving in postgresql.conf
echo "wal_level = replica" >> postgresql.conf
echo "archive_mode = on" >> postgresql.conf
echo "archive_command = 'cp %p /backups/postgres/wal/%f'" >> postgresql.conf
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Backup Fails with "Permission Denied"
```bash
# Fix permissions
sudo chown -R $(whoami):$(whoami) /backups
chmod 755 /backups/postgres
```

#### 2. "Container not running" Error
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps | grep al-hidaya-db
```

#### 3. Restore Fails with "Database in use"
```bash
# Force disconnect all connections
docker exec al-hidaya-db psql -U alhidaya -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'alhidaya_db';"
```

#### 4. Out of Disk Space
```bash
# Check disk usage
df -h /backups

# Clean old backups manually
find /backups/postgres/daily -name "*.dump.gz" -mtime +30 -delete
```

### Backup Validation

```bash
# Test restore to temporary database
docker exec al-hidaya-db createdb -U alhidaya test_restore
docker exec al-hidaya-db pg_restore -U alhidaya -d test_restore /tmp/backup.dump
docker exec al-hidaya-db dropdb -U alhidaya test_restore
```

## 📊 Monitoring & Alerts

### Email Notifications

Configure email alerts by setting environment variables:
```bash
# In .env file
ADMIN_EMAIL=admin@example.com
SMTP_SERVER=smtp.gmail.com:587
```

### Backup Status Check

```bash
# Check last backup time
ls -la /backups/postgres/daily/ | tail -1

# Verify backup automation
docker exec al-hidaya-backup crontab -l
```

### Health Check Script

```bash
#!/bin/bash
# check-backup-health.sh

LAST_BACKUP=$(ls -t /backups/postgres/daily/*.dump.gz | head -1)
BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_BACKUP")) / 3600 ))

if [ $BACKUP_AGE -gt 24 ]; then
    echo "WARNING: Last backup is $BACKUP_AGE hours old"
    exit 1
fi

echo "OK: Last backup is $BACKUP_AGE hours old"
```

## 🔐 Security Best Practices

1. **Encrypt Backups**
```bash
# Encrypt backup
gpg --encrypt --recipient admin@example.com backup.dump.gz

# Decrypt backup
gpg --decrypt backup.dump.gz.gpg > backup.dump.gz
```

2. **Secure Transfer**
```bash
# Transfer to remote server
rsync -avz --progress /backups/postgres/ user@remote:/remote/backups/
```

3. **Access Control**
```bash
# Restrict backup directory access
chmod 700 /backups/postgres
chown postgres:postgres /backups/postgres
```

## 📈 Performance Optimization

### Backup Performance

1. **Parallel Backup** (for large databases)
```bash
pg_dump -j 4  # Use 4 parallel jobs
```

2. **Compression Level**
```bash
# Faster compression (lower ratio)
gzip -1 backup.dump

# Better compression (slower)
gzip -9 backup.dump
```

### Restore Performance

1. **Disable Triggers During Restore**
```bash
pg_restore --disable-triggers
```

2. **Increase Work Memory**
```sql
SET work_mem = '256MB';
SET maintenance_work_mem = '512MB';
```

## 🎯 Recovery Scenarios

### Scenario 1: Accidental Data Deletion
```bash
# Quick restore from today's backup
./scripts/restore-postgres.sh --force
```

### Scenario 2: Database Corruption
```bash
# Stop all services
docker-compose down

# Start only PostgreSQL
docker-compose up -d postgres

# Restore from last known good backup
./scripts/restore-postgres.sh --date 20240101 --force

# Restart all services
docker-compose up -d
```

### Scenario 3: Point-in-Time Recovery
```bash
# Requires WAL archiving enabled
pg_restore --recovery-target-time="2024-01-01 14:30:00"
```

## 📝 Maintenance Schedule

### Daily
- Automated backup at 2 AM
- Verify backup completion

### Weekly
- Check backup sizes and growth
- Verify weekly backup promotion
- Test restore procedure (staging environment)

### Monthly
- Full restore test
- Clean up old restore points
- Review and update retention policy
- Check disk space usage

### Quarterly
- Disaster recovery drill
- Update backup documentation
- Review backup strategy

## 🆘 Emergency Contacts

In case of critical backup/restore issues:

1. Check logs: `docker logs al-hidaya-backup`
2. Review this documentation
3. Check PostgreSQL logs: `docker logs al-hidaya-db`
4. Contact system administrator

---

**Remember**: Regular backup testing is crucial. A backup is only as good as its last successful restore!