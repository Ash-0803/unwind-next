-- Complete the user creation by adding the missing identity record
-- This fixes the "invalid_credentials" error

-- First, get the user ID we created
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get the ID of the user we created
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'sanchalak@unwind.com';
  
  IF user_uuid IS NOT NULL THEN
    -- Insert the missing identity record
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_uuid,
      jsonb_build_object(
        'email', 'sanchalak@unwind.com',
        'sub', user_uuid::text,
        'email_verified', true
      ),
      'email',
      NOW(),
      NOW()
    ) ON CONFLICT (user_id, provider) DO NOTHING;
    
    -- Update user metadata
    UPDATE auth.users 
    SET 
      raw_user_meta_data = '{}',
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      email_confirmed_at = NOW(),
      last_sign_in_at = NOW()
    WHERE email = 'sanchalak@unwind.com';
    
    RAISE NOTICE 'User identity created successfully for sanchalak@unwind.com';
  ELSE
    RAISE NOTICE 'User not found, creating new one...';
    
    -- Create complete user with identity
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      raw_app_meta_data
    ) VALUES (
      (SELECT id FROM auth.instances LIMIT 1),
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'sanchalak@unwind.com',
      crypt('12ka442ka1', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{}',
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email'])
    ) RETURNING id INTO user_uuid;
    
    -- Create the identity record
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_uuid,
      jsonb_build_object(
        'email', 'sanchalak@unwind.com',
        'sub', user_uuid::text,
        'email_verified', true
      ),
      'email',
      NOW(),
      NOW()
    );
  END IF;
END $$;
