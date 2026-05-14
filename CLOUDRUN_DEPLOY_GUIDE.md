# SafeWallet — Cloud Run Deployment Guide

## Arsitektur Dual Deploy

```
main branch  ──push──► Vercel         (Frontend global, CDN edge, Cron bawaan)
cloudrun branch ──push──► Cloud Run   (Jakarta, Docker container, scale-to-zero)
```

Keduanya **berbagi** Supabase DB, Gemini/OpenRouter API, dan Upstash Redis yang sama.
**Tidak ada perubahan kode aplikasi.**

---

## Prasyarat

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) sudah terinstall
- Akun Google Cloud (billing aktif, tapi Cloud Run free tier sangat luas)
- Repository SafeWallet di GitHub

---

## Langkah 1: Setup GCP (Jalankan Sekali)

### 1a. Login & Buat Project GCP

```bash
# Login ke GCP
gcloud auth login

# Buat project baru (atau pakai yang sudah ada)
gcloud projects create safewallet-cloudrun --name="SafeWallet Cloud Run"

# Aktifkan billing (wajib untuk Cloud Run) — lakukan di GCP Console
# https://console.cloud.google.com/billing
```

### 1b. Jalankan Setup Script

Script ini akan secara otomatis membuat:
- Service Account dengan role minimal
- Artifact Registry repository
- Workload Identity Pool & Provider (koneksi aman GitHub ↔ GCP)

```bash
# Di Windows, gunakan Git Bash atau WSL:
chmod +x scripts/setup-gcp-wif.sh

# Edit variabel di atas script terlebih dahulu!
nano scripts/setup-gcp-wif.sh
# Ubah: PROJECT_ID, GITHUB_ORG, GITHUB_REPO

./scripts/setup-gcp-wif.sh
```

Script akan mencetak 3 nilai penting di akhir. **Catat nilai tersebut.**

---

## Langkah 2: Tambahkan GitHub Secrets

Buka: `GitHub Repo → Settings → Secrets and variables → Actions → New repository secret`

### Secrets Infrastructure (dari output script):

| Secret Name | Nilai |
|---|---|
| `GCP_PROJECT_ID` | ID project GCP Anda (contoh: `safewallet-cloudrun`) |
| `GCP_WIF_PROVIDER` | Resource name WIF Provider (format panjang dari script) |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `safewallet-deployer@PROJECT_ID.iam.gserviceaccount.com` |
| `CLOUDRUN_APP_URL` | URL Cloud Run (isi setelah deploy pertama) |

### Secrets Aplikasi (sama persis dengan .env.local Vercel):

| Secret Name | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (shared dengan Vercel) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `OPENROUTER_API_KEY` | OpenRouter/Gemini API Key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token |
| `CRON_SECRET` | Secret untuk endpoint cron |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |

> **Catatan:** Supabase, Redis, dan API Key yang sama bisa digunakan oleh keduanya. Tidak perlu membuat akun/project baru.

---

## Langkah 3: Deploy ke Cloud Run

```bash
# Buat branch cloudrun dari main
git checkout main
git pull origin main
git checkout -b cloudrun
git push origin cloudrun
```

GitHub Actions otomatis berjalan! Lihat progress di:
`GitHub Repo → Actions → Deploy to Cloud Run`

---

## Alur Kerja CI/CD

```
Push ke cloudrun branch
        │
        ▼
[GitHub Actions - deploy-cloudrun.yml]
        │
        ├─ Authenticate via Workload Identity Federation (OIDC)
        │   └─ Tidak ada service account key file! Aman 100%
        │
        ├─ Build Docker image (Next.js standalone mode)
        │   └─ Layer caching untuk build cepat
        │
        ├─ Push ke Artifact Registry (asia-southeast2)
        │
        └─ Deploy ke Cloud Run
            ├─ Region: Jakarta (asia-southeast2)
            ├─ Min instances: 0 (scale-to-zero = gratis saat idle)
            ├─ Max instances: 10
            ├─ Memory: 512Mi
            └─ CPU: 1 vCPU
```

---

## Biaya & Free Tier Cloud Run

Cloud Run memiliki free tier sangat generous:

| Resource | Free Tier/Bulan |
|---|---|
| CPU | 180,000 vCPU-seconds |
| Memory | 360,000 GB-seconds |
| Requests | 2,000,000 requests |
| Networking | 1 GB egress |

Untuk aplikasi dengan traffic rendah-menengah, **biaya Cloud Run bisa $0/bulan**.

---

## Perbedaan Vercel vs Cloud Run

| Aspek | Vercel (main) | Cloud Run (cloudrun) |
|---|---|---|
| Trigger | Push ke `main` | Push ke `cloudrun` |
| Region | Global CDN | Jakarta (asia-southeast2) |
| Cold start | ~50ms | ~2-5 detik (first request) |
| Cron jobs | ✅ via `vercel.json` | ⚠️ Perlu Cloud Scheduler (setup terpisah) |
| Custom domain | ✅ Mudah | ✅ Bisa via Cloud Run custom domain |
| Biaya | Free tier Vercel | Cloud Run free tier |
| Docker | ❌ Tidak perlu | ✅ Full Docker container |

---

## Update `.env` untuk Cloud Run

Setelah deploy pertama, update `CLOUDRUN_APP_URL` di GitHub Secrets dengan URL yang diberikan Cloud Run (format: `https://safewallet-app-xxxxxxxxxx-et.a.run.app`).

---

## Troubleshooting

```bash
# Lihat logs Cloud Run
gcloud run services logs read safewallet-app --region=asia-southeast2

# Describe service
gcloud run services describe safewallet-app --region=asia-southeast2

# Rollback ke revision sebelumnya
gcloud run services update-traffic safewallet-app \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-southeast2
```
