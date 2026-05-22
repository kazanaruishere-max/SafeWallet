-- ==============================================================
-- Migration: 012_scan_metrics_persistence
-- Description: Persists normalized health-scan metrics so dashboard
--              reads do not depend on transient API response data.
--              Values are percentages in the 0-100 range.
-- ==============================================================

ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS debt_to_income_ratio NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS savings_rate NUMERIC(5, 2);

DO $$
BEGIN
  ALTER TABLE public.scans
  ADD CONSTRAINT scans_debt_to_income_ratio_percent
  CHECK (debt_to_income_ratio IS NULL OR (debt_to_income_ratio >= 0 AND debt_to_income_ratio <= 100));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.scans
  ADD CONSTRAINT scans_savings_rate_percent
  CHECK (savings_rate IS NULL OR (savings_rate >= 0 AND savings_rate <= 100));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.scans.debt_to_income_ratio IS
  'Debt-to-income ratio as a normalized percentage from 0 to 100. Example: 35 means 35%, not 0.35.';

COMMENT ON COLUMN public.scans.savings_rate IS
  'Savings rate as a normalized percentage from 0 to 100. Example: 20 means 20%, not 0.20.';

NOTIFY pgrst, 'reload schema';
