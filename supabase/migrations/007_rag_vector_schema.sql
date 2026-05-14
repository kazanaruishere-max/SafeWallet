-- ==============================================================
-- Migration: 007_rag_vector_schema
-- Description: Mengaktifkan pgvector dan membuat tabel pengetahuan
--              (Knowledge Base) untuk RAG (Retrieval-Augmented Generation)
-- ==============================================================

-- 1. Aktifkan Ekstensi Vector (pgvector)
-- Jika gagal, pastikan Supabase Project Anda mengizinkan ekstensi ini.
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Buat Tabel Pengetahuan (Knowledge Base) OJK & Scam
CREATE TABLE IF NOT EXISTS public.ojk_knowledge (
    id BIGSERIAL PRIMARY KEY,
    source_type TEXT NOT NULL,         -- Contoh: 'ojk_ilegal', 'scam_pattern', 'edukasi'
    entity_name TEXT,                  -- Contoh: 'Pinjol Mutiara', 'Loker Telegram'
    content TEXT NOT NULL,             -- Penjelasan lengkap atau modus
    metadata JSONB DEFAULT '{}'::jsonb,-- Data ekstra (tanggal rilis, link referensi)
    embedding VECTOR(768),             -- Vektor 768 dimensi (standar Google Gemini Embedding)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indeks HNSW (Hierarchical Navigable Small World)
-- Sangat penting untuk membuat pencarian kedekatan vektor menjadi super cepat.
-- Menggunakan operator vector_cosine_ops untuk Cosine Similarity.
CREATE INDEX ON public.ojk_knowledge USING hnsw (embedding vector_cosine_ops);

-- 4. Fungsi Pencarian Kedekatan (Similarity Search Function)
-- Fungsi ini akan dipanggil dari Next.js backend (RAG Layer) untuk mencari konteks.
CREATE OR REPLACE FUNCTION match_ojk_knowledge(
    query_embedding VECTOR(768),
    match_threshold FLOAT,     -- Minimal kemiripan (contoh: 0.78)
    match_count INT            -- Maksimal dokumen yang diambil (contoh: 3)
)
RETURNS TABLE (
    id BIGINT,
    source_type TEXT,
    entity_name TEXT,
    content TEXT,
    metadata JSONB, 
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ok.id,
        ok.source_type,
        ok.entity_name,
        ok.content,
        ok.metadata,
        1 - (ok.embedding <=> query_embedding) AS similarity
    FROM public.ojk_knowledge ok
    WHERE 1 - (ok.embedding <=> query_embedding) > match_threshold
    ORDER BY ok.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Row Level Security (RLS) - Sangat Ketat
-- Kita pastikan tabel ini TIDAK BISA diubah sembarangan oleh user dari Front-End.
ALTER TABLE public.ojk_knowledge ENABLE ROW LEVEL SECURITY;

-- Hanya Service Role (Backend Vercel) yang bisa menambah/merubah data pengetahuan ini.
CREATE POLICY "Strict Admin Write" 
    ON public.ojk_knowledge 
    FOR ALL 
    TO service_role 
    USING (true);

-- User biasa / Anon TIDAK BISA membaca langsung tabel ini dari Front-End (Client Component).
-- Harus melewati Backend Next.js (RAG Pipeline) untuk membacanya.
CREATE POLICY "Deny Public Read" 
    ON public.ojk_knowledge 
    FOR SELECT 
    TO public 
    USING (false);
