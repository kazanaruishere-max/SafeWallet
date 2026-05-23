#!/bin/bash
# scripts/sync-backup.sh
#
# SafeWallet — Sync main branch to cloudrun branch (GCP Backup)
#
# This script automates merging the main branch (Vercel) into the cloudrun branch (GCP)
# to ensure both environments receive the latest features without manual errors.
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 SafeWallet Multi-Cloud Sync Tool${NC}"
echo "----------------------------------------"

# 1. Check if git has clean working directory
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Error: You have uncommitted changes. Please stash or commit them first.${NC}"
  exit 1
fi

# 2. Get current branch name
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# 3. Pull latest changes for main
echo -e "${YELLOW}📥 Fetching latest changes from remote...${NC}"
git fetch origin

# 4. Perform the merge and sync
echo -e "${YELLOW}🔀 Switching to cloudrun branch...${NC}"
git checkout cloudrun

echo -e "${YELLOW}📥 Pulling latest cloudrun branch...${NC}"
git pull origin cloudrun

echo -e "${YELLOW}🔄 Merging main into cloudrun...${NC}"
git merge main --no-edit -m "merge: sync latest features from main"

echo -e "${YELLOW}📤 Pushing updates to origin/cloudrun to trigger GCP CI/CD...${NC}"
git push origin cloudrun

# 5. Switch back to original branch
echo -e "${YELLOW}🔁 Returning to your original branch (${CURRENT_BRANCH})...${NC}"
git checkout "$CURRENT_BRANCH"

echo "----------------------------------------"
echo -e "${GREEN}✅ Sync Successful! GCP CI/CD has been triggered on 'cloudrun' branch.${NC}"
echo -e "${GREEN}Both Vercel (Main) and GCP Cloud Run (Backup) will now run the exact same features. 🎉${NC}"
