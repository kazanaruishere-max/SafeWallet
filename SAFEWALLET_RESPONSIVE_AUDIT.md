# 📱 SafeWallet Landing Page — Responsive Audit untuk Mobile

**Date:** 14 Maret 2026  
**Target:** iPhone SE (375px) → iPhone 14 (393px) → Android (360px) → Tablet (768px)  
**File utama:** `src/app/page.tsx`

---

## Status Saat Ini

Landing page saat ini didesain **desktop-first** tanpa adaptasi mobile yang memadai. Seluruh GSAP visual, tipografi, dan layout mengasumsikan viewport ≥1024px.

---

## 🔴 Masalah Kritis

### 1. Navbar — Tidak Ada Hamburger Menu

**Sekarang:**
```
[🛡 SafeWallet]                    [Login] [Get Started]
└─────────── satu baris, selalu horizontal ───────────┘
```

**Di mobile 360px:**
- Logo + 2 button dalam satu baris → **terlalu padat**
- Tombol "Get Started" bisa terpotong atau overflow
- Tidak ada hamburger (☰) menu
- `px-6` (24px padding) makan banyak ruang di mobile

**Solusi:**
```
Mobile (<md):    [🛡 SafeWallet]  [☰]
                  ↓ dropdown: Login | Get Started

Desktop (≥md):   [🛡 SafeWallet]  [Login] [Get Started]
```

---

### 2. Hero Typography — Overflow Horizontal

**Sekarang:**
```tsx
<h1 className="text-6xl md:text-8xl ...">Selamatkan Dompetmu...</h1>
```

| Breakpoint | Font Size | Lebar Karakter ± | Viewport | Hasil |
|---|---|---|---|---|
| Mobile | `text-6xl` = 60px | ~700px | 360px | ❌ **Overflow** |
| Desktop | `text-8xl` = 96px | ~1100px | 1440px | ✅ OK |

**Solusi:**
```tsx
className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl"
```

---

### 3. Orbit Rings — Ukuran Fixed Overflow Mobile

**Sekarang:**
```tsx
<div className="w-64 h-64 ..." />  // 256px — 71% dari viewport 360px
```

3 ring bertumpuk + absolute positioning → overflow di mobile.

**Solusi:**
```tsx
className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64"
```

---

### 4. AI Surveillance Eye — Border Terlalu Tebal

**Sekarang:**
```tsx
<div className="w-48 h-48 border-[20px] ..." />
```

`border-[20px]` pada elemen `w-48` (192px) di mobile → area dalam sangat kecil, pupil hampir tidak terlihat.

**Solusi:**
```tsx
className="w-32 h-32 md:w-48 md:h-48 border-[12px] md:border-[20px]"
```

---

### 5. Phase 8 "INDONESIA" — Text Overflow Masif

**Sekarang:**
```tsx
<h2 className="text-[8rem] md:text-[18rem] ...">INDONESIA</h2>
```

`text-[8rem]` = 128px → kata "INDONESIA" (9 huruf) membutuhkan ~1100px lebar → **3× overflow** pada layar 360px.

**Solusi:**
```tsx
className="text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[14rem] xl:text-[18rem]"
```

---

### 6. Constellation City Labels — Posisi Tumpang Tindih

8 kota Indonesia dengan posisi `absolute` berdasarkan percentage:
```tsx
<div className="absolute" style={{ top: "15%", left: "30%" }}>Jakarta</div>
<div className="absolute" style={{ top: "15%", left: "55%" }}>Medan</div>
```

Di mobile, jarak antar persentase terlalu kecil → label saling tumpang tindih.

**Solusi:** Sembunyikan beberapa label di mobile, hanya tampilkan 3-4 kota utama:
```tsx
<div className="hidden sm:block absolute ..." >Palembang</div>  // Hanya desktop
<div className="absolute ...">Jakarta</div>  // Selalu tampil
```

---

### 7. HexGrid HUD — 48 Hexagon Overflow

48 hexagon grid dengan posisi absolute → di mobile membuat horizontal scroll atau visual berantakan.

**Solusi:** Kurangi jumlah hexagon di mobile (24 cukup), perkecil ukurannya.

---

### 8. ScrollVelocity Text — Mungkin Terlalu Besar

```tsx
<ScrollVelocity texts={['SafeWallet']} velocity={100} className="..." />
```

Jika font size terlalu besar, teks overflow viewport width.

---

### 9. GSAP Scroll Depth — Terlalu Panjang di Mobile

| Section | Desktop | Masalah di Mobile |
|---|---|---|
| Orbit Rings | `+=600%` | User harus scroll 21600px (6× viewport) — terlalu panjang |
| AI Eye | `+=800%` | 28800px scroll — terlalu panjang |
| Phase 7 | `+=1000%` | 36000px — ekstrem |
| Phase 8 | `+=1500%` | 54000px — ± 150 thumb swipes |

**Total estimated scroll pada mobile:** ~150.000px → **tidak realistis**

**Solusi:** Kurangi depth 40-60% di mobile via JS:
```ts
const isMobile = window.innerWidth < 768;
const depth = isMobile ? "+=400%" : "+=800%";
```

---

### 10. CTA Button — Terlalu Besar di Mobile

**Sekarang:**
```tsx
className="h-20 px-16 text-2xl ..."  // 80px tinggi, 64px padding
```

Di mobile 360px, button hampir memenuhi seluruh lebar layar.

**Solusi:**
```tsx
className="h-14 px-8 text-lg sm:h-16 sm:px-10 sm:text-xl md:h-20 md:px-16 md:text-2xl"
```

---

## 📊 Checklist Perbaikan

| # | Area | Masalah | Fix | Priority |
|:---:|---|---|---|:---:|
| 1 | Navbar | No hamburger menu | Tambah ☰ untuk `<md` | 🔴 |
| 2 | Hero H1 | `text-6xl` overflow | Scale `text-3xl → 8xl` | 🔴 |
| 3 | Phase 8 H2 | `text-[8rem]` overflow | Scale `text-[3rem] → 18rem` | 🔴 |
| 4 | Orbit Rings | `w-64` terlalu besar | Scale `w-40 → w-64` | 🟠 |
| 5 | AI Eye | `border-[20px]` besar | Scale `border-[12px] → 20px` | 🟠 |
| 6 | City Labels | Tumpang tindih | Hide some on mobile | 🟠 |
| 7 | Scroll Depth | 150K px total | Reduce 40-60% on mobile | 🟠 |
| 8 | CTA Button | `h-20 px-16` overflow | Scale to `h-14 px-8` | 🟡 |
| 9 | HexGrid | 48 hex overflow | Reduce to 24 on mobile | 🟡 |
| 10 | ScrollVelocity | Font mungkin overflow | Scale font di mobile | 🟡 |

---

## 🎯 Strategi Implementasi

### Phase 1: Layout & Typography (Paling Berdampak)
1. Navbar → Hamburger menu component
2. Semua `text-*` → responsive breakpoints
3. CTA buttons → responsive sizing

### Phase 2: GSAP Visual Elements
4. Orbit rings, Eye, HexGrid → responsive sizing
5. City labels → conditional visibility
6. Scroll depth → conditional via `window.innerWidth`

### Phase 3: Polish
7. Padding/margin adjustments
8. Touch-friendly tap targets (min 44×44px)
9. Test di Chrome DevTools (iPhone SE, iPhone 14, Pixel 7)

---

## 🔧 Prinsip Desain Mobile

1. **Tetap premium** — Visual animasi GSAP tetap jalan, hanya di-scale bukan dihapus
2. **Touch-first** — Semua interactive element minimal 44×44px
3. **Performance** — Kurangi jumlah DOM element di mobile (fewer hexagons, fewer city labels)
4. **Scroll realistis** — Total scroll mobile ≤ 80.000px (masih panjang tapi achievable)
5. **Font readability** — Minimum 14px body text, 28px heading di mobile
