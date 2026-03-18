# 🛡️ SafeWallet: Incident Response Plan (IRP)

## 1. Pendahuluan
Dokumen ini merinci prosedur resmi untuk mengidentifikasi, menangani, dan memulihkan diri dari insiden keamanan di ekosistem SafeWallet. Tujuan utama adalah meminimalkan dampak terhadap pengguna dan data finansial.

## 2. Definisi Insiden
*   **Low**: Upaya scanning port, brute force yang terblokir otomatis.
*   **Medium**: Kegagalan servis minor, deteksi akses tidak sah ke akun non-admin.
*   **High**: Kebocoran data (Data Breach), manipulasi Integrity Hash, kegagalan infrastruktur kritis (DB Down).

## 3. Tim Respon Insiden (IRT)
*   **Security Lead**: Pengambil keputusan utama.
*   **DevOps Engineer**: Penanggung jawab isolasi infrastruktur.
*   **Legal & Compliance**: Penanganan pelaporan ke otoritas (jika terjadi kebocoran PII).

## 4. Fase Respon

### 4.1 Identifikasi (Detection)
*   Alerting dari Prometheus/Grafana (Latensi > 500ms, Error > 5%).
*   Alerting Sentry untuk anomali kode.
*   Laporan dari Bug Bounty program.

### 4.2 Kontensi (Containment)
*   **Short-term**: Putus akses API Gateway jika terdeteksi serangan aktif.
*   **Isolation**: Isolasi Pod K8s yang terinfeksi menggunakan Network Policies.
*   **Snapshot**: Ambil snapshot database dan log untuk investigasi forensik.

### 4.3 Eradikasi (Eradication)
*   Patching kerentanan yang ditemukan.
*   Reset semua Service Role Keys dan JWT secrets.
*   Deploy ulang infrastruktur menggunakan CI/CD pipeline yang bersih.

### 4.4 Pemulihan (Recovery)
*   Restore data dari PITR (Point-In-Time Recovery) jika terjadi kerusakan data.
*   Verifikasi Integritas: Jalankan modul Rust `verify_all_hashes` untuk memastikan tidak ada data yang dimanipulasi.
*   Monitor trafik secara intensif selama 48 jam pertama.

### 4.5 Evaluasi Pasca-Insiden (Lessons Learned)
*   Analisis akar masalah (Root Cause Analysis).
*   Pembaruan IRP berdasarkan temuan baru.
*   Pelaporan transparan kepada pengguna (jika diperlukan sesuai UU PDP).

## 5. Kontak Darurat
*   Slack: `#incident-response`
*   PagerDuty: SafeWallet-OnCall
*   Email: `security@safewallet.id`
