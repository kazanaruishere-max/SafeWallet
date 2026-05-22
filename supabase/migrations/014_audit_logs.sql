-- ==============================================================
-- Migration: 014_audit_logs
-- Description: Adds durable audit logging for sensitive user actions.
--              Writes are backend-only; users may read their own logs.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (
    action IN (
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_DELETE',
      'PROFILE_UPDATE',
      'SUBSCRIPTION_UPDATE',
      'SECURITY_EVENT',
      'DATA_EXPORT'
    )
  ),
  status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED')),
  request_id UUID NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
ON public.audit_logs(action, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_logs_request_id
ON public.audit_logs(request_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
CREATE POLICY "Users can read own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;
CREATE POLICY "Service role can manage audit logs"
ON public.audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.audit_logs IS
  'Durable security audit log for sensitive SafeWallet actions. Do not store raw financial data or secrets in details.';

NOTIFY pgrst, 'reload schema';
