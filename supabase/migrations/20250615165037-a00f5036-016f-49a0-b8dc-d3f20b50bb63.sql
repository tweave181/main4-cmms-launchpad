
-- 1. Drop ALL recursive or problematic RLS policies on public.users
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "select_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles in their tenant" ON public.users;
DROP POLICY IF EXISTS "Allow tenant users to read user data" ON public.users;
DROP POLICY IF EXISTS "Allow tenant users to update user data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update users in their tenant" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their tenant" ON public.users;
DROP POLICY IF EXISTS "user_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "user_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "Profile access" ON public.users;

-- 2. Re-Create SECURITY DEFINER functions to avoid recursion in policies

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid() LIMIT 1), false);
$$;

-- 3. Enable RLS (if not already)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Add SAFE, NON-RECURSIVE RLS POLICIES:

-- a) Allow users to SELECT their own profile
CREATE POLICY "user_view_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- b) Allow users to UPDATE their own profile (optional, if needed)
CREATE POLICY "user_update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- c) Allow users to SELECT all users in their own tenant (e.g., for user lists)
CREATE POLICY "users_view_same_tenant"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

-- d) Allow admins to UPDATE users in their tenant
CREATE POLICY "admins_update_same_tenant"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = public.get_current_user_tenant_id()
    AND public.is_current_user_admin()
  )
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id()
    AND public.is_current_user_admin()
  );

-- e) Optionally, allow admins to DELETE users in their tenant (uncommon, but sometimes needed)
DROP POLICY IF EXISTS "admins_delete_same_tenant" ON public.users;
CREATE POLICY "admins_delete_same_tenant"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_current_user_tenant_id()
    AND public.is_current_user_admin()
  );

