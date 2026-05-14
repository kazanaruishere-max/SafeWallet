#!/usr/bin/env bash
# scripts/setup-gcp-wif.sh
#
# SafeWallet — GCP Workload Identity Federation Setup Script
#
# Jalankan SEKALI dari lokal (bukan di CI).
# Prasyarat: gcloud CLI sudah terinstall & sudah `gcloud auth login`
#
# Cara pakai:
#   1. Edit variabel di bagian CONFIG di bawah
#   2. chmod +x scripts/setup-gcp-wif.sh
#   3. ./scripts/setup-gcp-wif.sh
#
# ================================================================

set -euo pipefail

# ================================================================
# CONFIG — sesuaikan dengan akun Anda
# ================================================================
PROJECT_ID="safewallet-496212"          # Ganti dengan GCP Project ID Anda
GITHUB_ORG="kazanaruishere-max"        # Ganti dengan username/org GitHub Anda
GITHUB_REPO="SafeWallet"                 # Nama repository GitHub
REGION="asia-southeast2"                 # Jakarta
SERVICE_ACCOUNT_NAME="safewallet-deployer"
WIF_POOL_NAME="safewallet-github-pool"
WIF_PROVIDER_NAME="safewallet-github-provider"
ARTIFACT_REPO="safewallet"
# ================================================================

SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=================================================="
echo "  SafeWallet GCP WIF Setup"
echo "  Project: ${PROJECT_ID}"
echo "  Repo   : ${GITHUB_ORG}/${GITHUB_REPO}"
echo "=================================================="

# Step 1: Set active project
echo ""
echo "▶ Step 1: Setting active GCP project..."
gcloud config set project "${PROJECT_ID}"

# Step 2: Enable required APIs
echo ""
echo "▶ Step 2: Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  --quiet

echo "  ✅ APIs enabled"

# Step 3: Create Artifact Registry repository
echo ""
echo "▶ Step 3: Creating Artifact Registry repository..."
if gcloud artifacts repositories describe "${ARTIFACT_REPO}" \
  --location="${REGION}" --quiet 2>/dev/null; then
  echo "  ℹ️  Repository '${ARTIFACT_REPO}' sudah ada, skipping..."
else
  gcloud artifacts repositories create "${ARTIFACT_REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="SafeWallet Docker images" \
    --quiet
  echo "  ✅ Repository created"
fi

# Step 4: Create Service Account untuk deployment
echo ""
echo "▶ Step 4: Creating Service Account..."
if gcloud iam service-accounts describe "${SA_EMAIL}" --quiet 2>/dev/null; then
  echo "  ℹ️  Service Account sudah ada, skipping..."
else
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="SafeWallet GitHub Actions Deployer" \
    --description="Used by GitHub Actions via WIF to deploy SafeWallet" \
    --quiet
  echo "  ✅ Service Account created: ${SA_EMAIL}"
fi

# Step 5: Grant minimal roles ke Service Account
echo ""
echo "▶ Step 5: Granting IAM roles to Service Account..."
ROLES=(
  "roles/run.admin"                          # Deploy & manage Cloud Run
  "roles/artifactregistry.writer"            # Push Docker images
  "roles/iam.serviceAccountUser"             # Impersonate SA untuk Cloud Run
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --condition=None \
    --quiet
  echo "  ✅ Granted: ${ROLE}"
done

# Step 6: Buat Workload Identity Pool
echo ""
echo "▶ Step 6: Creating Workload Identity Pool..."
if gcloud iam workload-identity-pools describe "${WIF_POOL_NAME}" \
  --location=global --quiet 2>/dev/null; then
  echo "  ℹ️  Pool sudah ada, skipping..."
else
  gcloud iam workload-identity-pools create "${WIF_POOL_NAME}" \
    --location=global \
    --display-name="SafeWallet GitHub Actions Pool" \
    --quiet
  echo "  ✅ Pool created"
fi

# Ambil Pool ID
POOL_ID=$(gcloud iam workload-identity-pools describe "${WIF_POOL_NAME}" \
  --location=global \
  --format="value(name)")
echo "  Pool ID: ${POOL_ID}"

# Step 7: Buat Workload Identity Provider (GitHub OIDC)
echo ""
echo "▶ Step 7: Creating Workload Identity Provider for GitHub..."
if gcloud iam workload-identity-pools providers describe "${WIF_PROVIDER_NAME}" \
  --workload-identity-pool="${WIF_POOL_NAME}" \
  --location=global --quiet 2>/dev/null; then
  echo "  ℹ️  Provider sudah ada, skipping..."
else
  gcloud iam workload-identity-pools providers create-oidc "${WIF_PROVIDER_NAME}" \
    --workload-identity-pool="${WIF_POOL_NAME}" \
    --location=global \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository=='${GITHUB_ORG}/${GITHUB_REPO}'" \
    --quiet
  echo "  ✅ Provider created"
fi

# Ambil Provider Resource Name
PROVIDER_RESOURCE=$(gcloud iam workload-identity-pools providers describe "${WIF_PROVIDER_NAME}" \
  --workload-identity-pool="${WIF_POOL_NAME}" \
  --location=global \
  --format="value(name)")

# Step 8: Binding — izinkan GitHub Actions menggunakan SA ini
echo ""
echo "▶ Step 8: Binding WIF Pool to Service Account..."
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}" \
  --quiet
echo "  ✅ Binding complete"

# ================================================================
# OUTPUT — Simpan nilai berikut ke GitHub Secrets!
# ================================================================
echo ""
echo "=================================================="
echo "  ✅ SETUP SELESAI! Simpan nilai berikut sebagai"
echo "     GitHub Secrets di repository Anda:"
echo "=================================================="
echo ""
echo "  Secret Name            │ Value"
echo "  ─────────────────────────────────────────────────────────────────"
echo "  GCP_PROJECT_ID         │ ${PROJECT_ID}"
echo "  GCP_WIF_PROVIDER       │ ${PROVIDER_RESOURCE}"
echo "  GCP_SERVICE_ACCOUNT_EMAIL │ ${SA_EMAIL}"
echo ""
echo "  + Tambahkan semua env vars dari .env.local Anda:"
echo "    CLOUDRUN_APP_URL, NEXT_PUBLIC_SUPABASE_URL, dll."
echo ""
echo "  📌 Cara menambah Secret:"
echo "     GitHub Repo → Settings → Secrets → Actions → New repository secret"
echo ""
echo "  📌 Cara deploy:"
echo "     git checkout -b cloudrun"
echo "     git push origin cloudrun"
echo "     → GitHub Actions otomatis berjalan!"
echo "=================================================="
