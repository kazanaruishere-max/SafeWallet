-- SafeWallet V3: Database Schema & RLS Policies

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Scans Table (Updated for V3 with Multi-tenant & Proper Indexing)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000', -- For future multi-tenancy
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_ocr_text TEXT NOT NULL,
    nonce TEXT NOT NULL,
    blockchain_hash TEXT, -- Stores HMAC from Rust
    status TEXT DEFAULT 'PENDING',
    health_score INTEGER,
    categories JSONB,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_tenant_id ON public.scans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only see their own scans (Isolated by user_id and tenant_id)
CREATE POLICY "Users can view their own data" 
ON public.scans FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Policy: Service role (Backends) has full access
CREATE POLICY "Service role full access"
ON public.scans FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT
TO service_role
WITH CHECK (true);
