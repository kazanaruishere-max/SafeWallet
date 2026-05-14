-- ==============================================================
-- Migration: 008_add_birth_year
-- Description: Menambahkan kolom birth_year pada tabel users 
--              untuk mendukung Context-Aware Demographics AI (Phase 3)
-- ==============================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS birth_year INTEGER;
