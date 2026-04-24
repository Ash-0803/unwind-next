-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Game details
  game_type TEXT NOT NULL,
  duration_seconds INTEGER,
  total_rounds INTEGER,
  location TEXT,
  notes TEXT,
  
  -- Game results
  winner_team_id TEXT,
  final_scores JSONB NOT NULL DEFAULT '{}',
  
  -- Teams data (stored as JSON array)
  teams JSONB NOT NULL DEFAULT '[]'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_game_type ON games(game_type);
CREATE INDEX IF NOT EXISTS idx_games_winner ON games(winner_team_id);

-- Enable RLS (Row Level Security)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (you can restrict this later)
CREATE POLICY "Enable all operations for all users" ON games
  FOR ALL USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
