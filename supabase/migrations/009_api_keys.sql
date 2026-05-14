-- ==============================================================
-- Migration: 009_api_keys
-- Description: Membuat tabel untuk B2B Enterprise API (Fase 1)
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,      -- Key yang akan diletakkan di header Authorization
    tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'business', 'enterprise')),
    monthly_quota INTEGER DEFAULT 1000,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Hanya Service Role (Vercel Backend) yang bisa mengakses tabel ini untuk memverifikasi API key.
-- Dilarang keras dibaca oleh publik atau frontend client.
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Strict Backend Only Access" 
    ON public.api_keys 
    FOR ALL 
    TO service_role 
    USING (true);

-- Membuat 1 API Key percobaan untuk testing (Bisa dihapus nanti)
INSERT INTO public.api_keys (company_name, api_key, tier, monthly_quota)
VALUES ('PT Fintek Coba Coba', 'sk_test_1234567890abcdef', 'starter', 100)
ON CONFLICT DO NOTHING;

-- Fungsi untuk menambah counter usage B2B API
CREATE OR REPLACE FUNCTION increment_api_usage(key_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.api_keys
  SET usage_count = usage_count + 1
  WHERE id = key_id;
END;
$$;
