-- ==============================================================
-- Migration: 013_ocr_encrypted_retention
-- Description: Enforces OCR retention policy. Raw OCR plaintext is
--              no longer retained; future OCR text is stored only in
--              encrypted_ocr_text when ENCRYPTION_KEY is configured.
-- ==============================================================

ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS encrypted_ocr_text TEXT;

COMMENT ON COLUMN public.scans.ocr_raw_text IS
  'Deprecated privacy-sensitive plaintext OCR field. SafeWallet keeps this NULL under the encrypted OCR retention policy.';

COMMENT ON COLUMN public.scans.encrypted_ocr_text IS
  'AES-256-GCM encrypted OCR text. May be NULL when encryption is unavailable and zero-retention fallback is used.';

-- Historical plaintext OCR cannot be safely encrypted in SQL because the
-- application-level ENCRYPTION_KEY is not available to the database. Redact it.
UPDATE public.scans
SET ocr_raw_text = NULL
WHERE ocr_raw_text IS NOT NULL;

NOTIFY pgrst, 'reload schema';
