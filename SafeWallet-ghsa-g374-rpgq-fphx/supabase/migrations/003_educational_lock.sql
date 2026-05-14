-- Migration 003: Educational Lock for Pinjol Rescue Feature
-- Adds tracking columns to enforce micro-learning when user's debt ratio is critical.

ALTER TABLE users 
ADD COLUMN debt_ratio NUMERIC DEFAULT 0,
ADD COLUMN needs_education_lock BOOLEAN DEFAULT FALSE,
ADD COLUMN modules_completed JSONB DEFAULT '[]'::jsonb;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
