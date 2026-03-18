-- Migration 006: Atomic Quota Management
-- Implements a stored procedure to atomically check and increment usage counts.

CREATE OR REPLACE FUNCTION increment_quota_atomic(
  p_user_id UUID,
  p_feature TEXT,
  p_period TEXT,
  p_limit INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
  v_new_count INTEGER;
BEGIN
  -- 1. Get or create the usage record with a row-level lock
  INSERT INTO usage_counts (user_id, feature, period, count)
  VALUES (p_user_id, p_feature, p_period, 0)
  ON CONFLICT (user_id, feature, period) DO NOTHING;

  -- 2. Lock the row and get the current count
  SELECT count INTO v_current_count
  FROM usage_counts
  WHERE user_id = p_user_id AND feature = p_feature AND period = p_period
  FOR UPDATE;

  -- 3. Check if increment is allowed
  IF v_current_count >= p_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QUOTA_EXCEEDED',
      'current', v_current_count,
      'limit', p_limit
    );
  END IF;

  -- 4. Increment and return success
  v_new_count := v_current_count + 1;
  UPDATE usage_counts
  SET count = v_new_count, updated_at = NOW()
  WHERE user_id = p_user_id AND feature = p_feature AND period = p_period;

  RETURN jsonb_build_object(
    'success', true,
    'current', v_new_count,
    'limit', p_limit,
    'remaining', p_limit - v_new_count
  );
END;
$$;
