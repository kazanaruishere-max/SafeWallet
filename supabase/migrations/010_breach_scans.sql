-- ==============================================================
-- Migration: 010_breach_scans
-- Description: Membuat tabel untuk fitur Data Breach Scanner (Fase 1 Jangka Pendek)
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.breach_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    search_query TEXT NOT NULL,         -- Disimpan dalam bentuk HASH (bukan teks asli email/no HP) demi privasi
    breach_count INTEGER DEFAULT 0,     -- Jumlah kebocoran yang ditemukan
    breach_details JSONB,               -- Detail situs apa saja yang bocor (Tokopedia, LinkedIn, dll)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) - Ketat
-- ============================================
ALTER TABLE public.breach_scans ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya boleh melihat hasil scan mereka sendiri
CREATE POLICY "Users can read own breach scans" 
    ON public.breach_scans 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Pengguna hanya boleh memasukkan data atas nama mereka sendiri
CREATE POLICY "Users can insert own breach scans" 
    ON public.breach_scans 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Membuat Index agar query riwayat scan lebih cepat
CREATE INDEX idx_breach_scans_user ON public.breach_scans(user_id, created_at DESC);
