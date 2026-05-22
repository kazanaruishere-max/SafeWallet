-- ==============================================================
-- Migration: 011_quota_schema_hardening
-- Description: Fixes usage_counts schema drift and hardens the
--              atomic quota RPC so quota enforcement cannot fail
--              because of a missing updated_at column.
-- ==============================================================

-- 1. Backfill timestamp columns expected by quota maintenance code.
ALTER TABLE public.usage_counts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.usage_counts
SET
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE public.usage_counts
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- 2. Guard against invalid counters without changing existing contracts.
DO $$
BEGIN
  ALTER TABLE public.usage_counts
  ADD CONSTRAINT usage_counts_count_nonnegative CHECK (count >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.usage_counts
  ADD CONSTRAINT usage_counts_feature_allowed
  CHECK (feature IN ('scan', 'scam_check', 'breach_check'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Replace quota RPC with a schema-qualified, race-safe implementation.
CREATE OR REPLACE FUNCTION public.increment_quota_atomic(
  p_user_id UUID,
  p_feature TEXT,
  p_period TEXT,
  p_limit INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_new_count INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  IF p_feature NOT IN ('scan', 'scam_check', 'breach_check') THEN
    RAISE EXCEPTION 'Unsupported quota feature: %', p_feature;
  END IF;

  IF p_period IS NULL OR LENGTH(TRIM(p_period)) = 0 THEN
    RAISE EXCEPTION 'p_period is required';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 THEN
    RAISE EXCEPTION 'p_limit must be greater than zero';
  END IF;

  -- Create the row if missing. ON CONFLICT keeps concurrent requests safe.
  INSERT INTO public.usage_counts (user_id, feature, period, count)
  VALUES (p_user_id, p_feature, p_period, 0)
  ON CONFLICT (user_id, feature, period) DO NOTHING;

  -- Lock the quota row before checking and incrementing.
  SELECT uc.count
  INTO v_current_count
  FROM public.usage_counts AS uc
  WHERE uc.user_id = p_user_id
    AND uc.feature = p_feature
    AND uc.period = p_period
  FOR UPDATE;

  IF v_current_count IS NULL THEN
    RAISE EXCEPTION 'Unable to lock quota row for user %, feature %, period %',
      p_user_id, p_feature, p_period;
  END IF;

  IF v_current_count >= p_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QUOTA_EXCEEDED',
      'current', v_current_count,
      'limit', p_limit,
      'remaining', 0
    );
  END IF;

  v_new_count := v_current_count + 1;

  UPDATE public.usage_counts AS uc
  SET
    count = v_new_count,
    updated_at = NOW()
  WHERE uc.user_id = p_user_id
    AND uc.feature = p_feature
    AND uc.period = p_period;

  RETURN jsonb_build_object(
    'success', true,
    'current', v_new_count,
    'limit', p_limit,
    'remaining', GREATEST(p_limit - v_new_count, 0)
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
