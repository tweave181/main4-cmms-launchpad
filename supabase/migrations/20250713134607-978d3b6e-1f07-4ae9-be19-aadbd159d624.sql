-- Fix #1: Standardize RLS policies to prevent recursion and ensure consistency
-- Replace inconsistent JWT claims usage with security definer functions

-- First, ensure our security definer functions exist and are correct
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

-- Fix #2: Remove duplicate user policies that could cause conflicts
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Fix #3: Standardize assets table policies to use security definer functions instead of JWT claims
-- This prevents inconsistency between tenant resolution methods
DROP POLICY IF EXISTS "create_assets_in_tenant" ON public.assets;
DROP POLICY IF EXISTS "update_assets_in_tenant" ON public.assets;
DROP POLICY IF EXISTS "delete_assets_in_tenant" ON public.assets;
DROP POLICY IF EXISTS "view_assets_by_tenant" ON public.assets;

-- Create new standardized policies for assets using security definer functions
CREATE POLICY "Users can create assets in their tenant"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update assets in their tenant"
ON public.assets
FOR UPDATE
TO authenticated
USING (tenant_id = get_current_user_tenant_id())
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete assets in their tenant"
ON public.assets
FOR DELETE
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can view assets in their tenant"
ON public.assets
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

-- Fix #4: Clean up the users table policies to prevent recursion
-- Keep only the essential policies and ensure they don't create self-references
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());