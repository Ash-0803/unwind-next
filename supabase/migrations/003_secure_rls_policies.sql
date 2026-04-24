-- Drop existing permissive policies
DROP POLICY IF EXISTS "Enable all operations for all users" ON games;

-- Create secure RLS policies using created_by column
-- Users can only read their own games
CREATE POLICY "Users can view own games" ON games
  FOR SELECT USING (auth.uid() = created_by);

-- Users can only insert their own games
CREATE POLICY "Users can insert own games" ON games
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can only update their own games
CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can only delete their own games
CREATE POLICY "Users can delete own games" ON games
  FOR DELETE USING (auth.uid() = created_by);

-- Alternative: Public read-only access (less secure but more collaborative)
-- Uncomment below for public games, comment above private policies

/*
-- Public read access (anyone can view games)
CREATE POLICY "Public read access" ON games
  FOR SELECT USING (true);

-- Authenticated users can create games
CREATE POLICY "Authenticated users can insert games" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own games
CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can only delete their own games  
CREATE POLICY "Users can delete own games" ON games
  FOR DELETE USING (auth.uid() = created_by);
*/
