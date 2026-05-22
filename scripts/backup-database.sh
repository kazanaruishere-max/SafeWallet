#!/bin/bash
# SafeWallet Database Backup Script
# Run this weekly via cron: 0 2 * * 0 /path/to/backup-database.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
SUPABASE_HOST="${SUPABASE_DB_HOST}"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting SafeWallet database backup..."
echo "📅 Date: $DATE"

# 1. Export schema only
echo "📋 Backing up schema..."
pg_dump -h "$SUPABASE_HOST" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  --schema-only \
  --no-owner \
  --no-acl \
  > "$BACKUP_DIR/schema_$DATE.sql"

# 2. Export non-sensitive data
echo "📊 Backing up non-sensitive data..."
pg_dump -h "$SUPABASE_HOST" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  --data-only \
  --exclude-table=scans \
  --exclude-table=audit_logs \
  --exclude-table=api_keys \
  > "$BACKUP_DIR/data_$DATE.sql"

# 3. Export sensitive data (encrypted)
echo "🔒 Backing up sensitive data (encrypted)..."
pg_dump -h "$SUPABASE_HOST" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  -t scans -t audit_logs \
  | gpg --encrypt --recipient "${GPG_RECIPIENT}" \
  > "$BACKUP_DIR/sensitive_$DATE.sql.gpg"

# 4. Compress backups
echo "📦 Compressing backups..."
tar -czf "$BACKUP_DIR/safewallet_backup_$DATE.tar.gz" \
  "$BACKUP_DIR/schema_$DATE.sql" \
  "$BACKUP_DIR/data_$DATE.sql" \
  "$BACKUP_DIR/sensitive_$DATE.sql.gpg"

# 5. Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
  echo "☁️  Uploading to S3..."
  aws s3 cp "$BACKUP_DIR/safewallet_backup_$DATE.tar.gz" \
    "s3://$AWS_S3_BUCKET/backups/"
fi

# 6. Cleanup old backups (keep last 30 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup complete: safewallet_backup_$DATE.tar.gz"
