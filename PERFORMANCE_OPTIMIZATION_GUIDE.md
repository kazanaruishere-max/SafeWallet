# Performance Optimization Guide: SafeWallet V3 Enterprise

Dokumen ini memberikan panduan teknis untuk mengoptimalkan SafeWallet V3 agar lebih ringan, cepat, dan efisien, dengan target penurunan ukuran bundle dan peningkatan kecepatan load minimal 30%.

---

## 1. Rekomendasi Konversi Gambar (CLI)

Untuk mengonversi mockup PNG/JPG ke WebP tanpa alat grafis, gunakan **`cwebp`** (bagian dari Google WebP tools) atau **`sharp-cli`**.

### **Opsi A: Menggunakan Sharp CLI (Rekomendasi Node.js)**
Jika Anda memiliki Node.js, ini adalah cara tercepat:
```bash
# Instalasi secara global
npm install -g sharp-cli

# Konversi satu file
sharp -i ./public/images/mockup.png -o ./public/images/mockup.webp

# Konversi massal seluruh isi folder
npx sharp-cli -i ./public/images/*.png -o ./public/images/ --format webp
```

### **Opsi B: Menggunakan Google cwebp (Native)**
```bash
# Untuk Windows (PowerShell)
foreach ($f in Get-ChildItem ./public/images/*.png) {
  cwebp -q 80 $f.FullName -o ($f.FullName -replace ".png", ".webp")
}
```

---

## 2. Analisis Performa & Identifikasi Bottleneck

### **Bottleneck Saat Ini**
1.  **Aset Visual**: Mockup 3D dalam format PNG non-kompresi (>5MB per file).
2.  **Library Animasi**: Pemuatan GSAP dan OGL di *initial load*.
3.  **Third-party Scripts**: Sentry dan monitoring yang berjalan di *main thread*.
4.  **Unused CSS**: Tailwind v4 sudah sangat efisien, namun masih ada potensi *unused styles* dari library pihak ketiga.

---

## 3. Strategi Optimasi Gambar & Aset

### **Implementasi Next.js Image**
Ganti tag `<img>` standar dengan `next/image` di [page.tsx](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/app/page.tsx).
```tsx
import Image from 'next/image';

// Sebelum
<img src="/images/mockup.png" alt="Mockup" />

// Sesudah (Otomatis WebP + Lazy Load)
<Image 
  src="/images/mockup.webp" 
  alt="Mockup" 
  width={800} 
  height={600} 
  priority={false} 
  placeholder="blur"
/>
```

---

## 4. Implementasi Lazy Loading & Code Splitting

### **Dynamic Imports dengan SSR Disabled**
Pastikan komponen berat WebGL hanya dimuat di client-side saat dibutuhkan.
```tsx
// v3/landing/page.tsx
const CircularGallery = dynamic(() => import("@/components/circular-gallery"), { 
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse bg-white/5" />
});
```

---

## 5. Minifikasi & Kompresi (next.config.ts)

Konfigurasi berikut memastikan bundle yang dikirim ke browser sekecil mungkin.

```typescript
// next.config.ts
const nextConfig = {
  compress: true, // Aktifkan Gzip/Brotli
  swcMinify: true, // Gunakan SWC compiler untuk minifikasi ultra cepat
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Hapus log di prod
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap', 'framer-motion'],
  }
};
```

---

## 6. Caching & Strategy

1.  **Cache-Control Headers**: Gunakan `s-maxage=31536000` untuk aset statis di `/public`.
2.  **Stale-While-Revalidate**: Gunakan strategi SWR untuk data dinamis dari Supabase agar UI terasa instan.

---

## 7. Panduan Testing Performa

### **Metrik Target**
- **LCP (Largest Contentful Paint)**: < 1.5s
- **TBT (Total Blocking Time)**: < 200ms
- **Bundle Size**: < 250KB (Initial JS)

### **Cara Testing**
1.  **Lighthouse Audit**: Jalankan di Chrome DevTools pada mode Incognito.
2.  **Next.js Bundle Analyzer**:
    ```bash
    ANALYZE=true npm run build
    ```
    Ini akan menampilkan visualisasi file mana yang paling besar dalam bundle Anda.

---

## 8. Checklist Implementasi
- [ ] Konversi semua aset di `/public/images` ke `.webp`.
- [ ] Pastikan tidak ada `import * as ...` pada library GSAP.
- [ ] Verifikasi `next.config.ts` sudah mencakup opsi `compress` dan `swcMinify`.
- [ ] Gunakan `priority={true}` hanya untuk gambar di atas *fold* (Hero).

**SafeWallet V3 akan menjadi jauh lebih ringan dan responsif dengan mengikuti panduan ini.**
