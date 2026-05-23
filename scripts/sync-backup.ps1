# scripts/sync-backup.ps1
#
# SafeWallet — Sync main branch to cloudrun branch (GCP Backup) for Windows
#
# This script automates merging the main branch (Vercel) into the cloudrun branch (GCP)
# to ensure both environments receive the latest features without manual errors.
#

$ErrorActionPreference = "Stop"

Write-Host "🔄 SafeWallet Multi-Cloud Sync Tool (Windows PowerShell)" -ForegroundColor Yellow
Write-Host "----------------------------------------"

# 1. Check if git has clean working directory (ignoring untracked files)
$gitStatus = git status --porcelain | Where-Object { $_ -notmatch '^\?\?\s' }
if ($gitStatus) {
    Write-Host "❌ Error: You have uncommitted changes in tracked files. Please stash or commit them first." -ForegroundColor Red
    Exit 1
}

# 2. Get current branch name
$CURRENT_BRANCH = git symbolic-ref --short HEAD

try {
    # 3. Fetch latest changes
    Write-Host "📥 Fetching latest changes from remote..." -ForegroundColor Yellow
    git fetch origin

    # 4. Switch to cloudrun branch
    Write-Host "🔀 Switching to cloudrun branch..." -ForegroundColor Yellow
    git checkout cloudrun

    # 5. Pull latest cloudrun
    Write-Host "📥 Pulling latest cloudrun branch..." -ForegroundColor Yellow
    git pull origin cloudrun

    # 6. Merge main into cloudrun
    Write-Host "🔄 Merging main into cloudrun..." -ForegroundColor Yellow
    git merge main --no-edit -m "merge: sync latest features from main"

    # 7. Push to origin cloudrun
    Write-Host "📤 Pushing updates to origin/cloudrun to trigger GCP CI/CD..." -ForegroundColor Yellow
    git push origin cloudrun

} catch {
    Write-Host "❌ An error occurred during the sync process: $_" -ForegroundColor Red
} finally {
    # 8. Switch back to original branch
    Write-Host "🔁 Returning to your original branch ($CURRENT_BRANCH)..." -ForegroundColor Yellow
    git checkout $CURRENT_BRANCH
}

Write-Host "----------------------------------------"
Write-Host "✅ Sync Successful! GCP CI/CD has been triggered on 'cloudrun' branch." -ForegroundColor Green
Write-Host "Both Vercel (Main) and GCP Cloud Run (Backup) will now run the exact same features. 🎉" -ForegroundColor Green
