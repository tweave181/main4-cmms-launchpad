
-- Phase 1: Remove the recursive RLS policy that's causing the 500 error
DROP POLICY IF EXISTS "users_select_policy" ON public.users;

-- Ensure we only have the simple, non-recursive policy
DROP POLICY IF EXISTS "select_own_profile" ON public.users;

-- Recreate the simple policy that uses auth.uid() = id (no recursion)
CREATE POLICY "select_own_profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Phase 3: Create repair function for missing profiles
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user RECORD;
  missing_count INTEGER := 0;
BEGIN
  -- Find auth.users that don't have corresponding public.users entries
  FOR auth_user IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users pu WHERE pu.id = au.id
    )
  LOOP
    -- Insert missing user profile using metadata
    INSERT INTO public.users (id, tenant_id, email, name, role)
    VALUES (
      auth_user.id,
      (auth_user.raw_user_meta_data->>'tenant_id')::uuid,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'name', 'User'),
      COALESCE((auth_user.raw_user_meta_data->>'role')::user_role, 'technician')
    );
    
    missing_count := missing_count + 1;
    RAISE LOG 'Inserted missing user profile for: %', auth_user.id;
  END LOOP;
  
  RAISE LOG 'Fixed % missing user profiles', missing_count;
END;
$$;
