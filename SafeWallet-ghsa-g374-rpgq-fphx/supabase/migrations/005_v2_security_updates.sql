-- Migration 005: SafeWallet v2 Security & Blockchain Integrity
-- This migration updates the scans table to support E2EE and Blockchain-inspired integrity.

-- 1. Add columns for E2EE and Blockchain Integrity to scans table
ALTER TABLE scans ADD COLUMN IF NOT EXISTS encrypted_ocr_text TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS blockchain_hash TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS blockchain_tx_id TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS integrity_status TEXT DEFAULT 'verified' CHECK (integrity_status IN ('verified', 'tampered', 'unverified'));

-- 2. Add columns for E2EE to scam_checks table
ALTER TABLE scam_checks ADD COLUMN IF NOT EXISTS encrypted_input_content TEXT;
ALTER TABLE scam_checks ADD COLUMN IF NOT EXISTS blockchain_hash TEXT;
ALTER TABLE scam_checks ADD COLUMN IF NOT EXISTS blockchain_tx_id TEXT;

-- 3. Update comments for transparency
COMMENT ON COLUMN scans.encrypted_ocr_text IS 'AES-256-GCM encrypted bank statement text';
COMMENT ON COLUMN scans.blockchain_hash IS 'SHA-256 integrity hash of the scan result';
COMMENT ON COLUMN scans.blockchain_tx_id IS 'Simulated or actual blockchain transaction ID';

-- 4. Audit Log for Security Events
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS on security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own security events" ON security_events FOR SELECT USING (auth.uid() = user_id);

-- 6. Trigger to alert on potential tampering (Simulated for Demo)
CREATE OR REPLACE FUNCTION check_integrity_on_select()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic to check if blockchain_hash matches current content
  -- In a real DB, this could be a background worker.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
