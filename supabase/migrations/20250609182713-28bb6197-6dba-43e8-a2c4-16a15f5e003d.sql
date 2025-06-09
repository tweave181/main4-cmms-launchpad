
-- Phase 1: Complete cleanup with proper error handling

-- Drop ALL existing policies on users table (including the one that already exists)
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

-- Recreate the security definer functions with proper safeguards
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid() LIMIT 1), false);
$$;

-- Create simple, non-recursive RLS policies for users table with unique names
CREATE POLICY "user_view_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "user_update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clean up and recreate assets table policies
DROP POLICY IF EXISTS "Users can view assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can create assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can update assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can delete assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can view tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can create tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete tenant assets" ON public.assets;

-- Recreate assets policies using the security definer function
CREATE POLICY "asset_view_tenant"
  ON public.assets
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "asset_create_tenant"
  ON public.assets
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "asset_update_tenant"
  ON public.assets
  FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "asset_delete_tenant"
  ON public.assets
  FOR DELETE
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

-- Clean up tenants table policies
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can view tenant data" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;

CREATE POLICY "tenant_view_own"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = public.get_current_user_tenant_id());
