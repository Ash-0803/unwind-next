-- Add missing created_by and updated_by columns to games table
-- These columns should have been in migration 001 but were added later

ALTER TABLE games ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);
CREATE INDEX IF NOT EXISTS idx_games_updated_by ON games(updated_by);
