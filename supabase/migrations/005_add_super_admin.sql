-- Create super admin user and update RLS policies

-- First, create a function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user's email matches the super admin email
  -- You can change this email to your desired super admin email
  RETURN auth.jwt() ->> 'email' = 'sanchalak@unwind.com';
END;
$$;

-- Update RLS policies to allow super admin full access
DROP POLICY IF EXISTS "Users can view own games" ON games;
DROP POLICY IF EXISTS "Users can insert own games" ON games;
DROP POLICY IF EXISTS "Users can update own games" ON games;
DROP POLICY IF EXISTS "Users can delete own games" ON games;

-- New policies with super admin access
CREATE POLICY "Super admin full access" ON games
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Users can view own games" ON games
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own games" ON games
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own games" ON games
  FOR DELETE USING (auth.uid() = created_by);

-- Allow super admin to bypass RLS entirely by granting them service role
-- This will be done manually in Supabase dashboard or via service role key
