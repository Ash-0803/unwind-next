# Super Admin Setup Instructions

## Overview

This setup creates a super admin user that has full access to the games system while maintaining Row Level Security (RLS) for regular users.

## Step 1: Run the Migration

Run the new migration to update RLS policies:

```bash
# If you're using Supabase CLI
supabase db push

# Or run the SQL manually in your Supabase dashboard:
# Run the contents of supabase/migrations/005_add_super_admin.sql
```

## Step 2: Create the Super Admin User

You need to create the super admin user in Supabase. You have two options:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Enter:
   - Email: `sanchalak@unwind.com`
   - Password: (choose a strong password)
   - Confirm the user is created

### Option B: Via SQL

```sql
-- Run this in your Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- your instance_id
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sanchalak@unwind.com',
  crypt('your_password_here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

## Step 3: Test the Setup

1. Navigate to `/teams` in your application
2. You should see the Super Admin Login screen
3. Login with:
   - Email: `sanchalak@unwind.com`
   - Password: (whatever you set in Step 2)

## Step 4: Verify Game Creation Works

After logging in as super admin:

1. Try to create a game
2. The RLS policy should now allow the super admin to create games
3. Check that the game is saved successfully

## Security Notes

- The super admin email is hardcoded as `sanchalak@unwind.com` - you can change this in the migration file
- Only users with this exact email will have super admin privileges
- Regular users (if you add them later) will only be able to access their own games
- The super admin bypasses RLS entirely and can access all games

## Customization

To change the super admin email:

1. Edit `supabase/migrations/005_add_super_admin.sql`
2. Change `sanchalak@unwind.com` to your desired email
3. Re-run the migration
4. Update the email in `src/contexts/AuthContext.tsx` and `src/components/SuperAdminLogin.tsx`

## Troubleshooting

- **Login fails**: Make sure the user exists in Supabase Authentication
- **RLS still blocks**: Check that the migration ran successfully
- **Access denied**: Verify the email matches exactly what's in the RLS policy
