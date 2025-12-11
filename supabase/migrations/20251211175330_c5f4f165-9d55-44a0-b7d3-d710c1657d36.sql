-- Add is_test_site flag to tenants table
ALTER TABLE public.tenants 
ADD COLUMN is_test_site boolean NOT NULL DEFAULT false;

-- Mark Sulis Hospital as a test site
UPDATE public.tenants 
SET is_test_site = true 
WHERE name = 'Sulis Hospital';

-- Create helper function to check if current user is from a test site tenant
CREATE OR REPLACE FUNCTION public.is_test_site_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.tenants t ON u.tenant_id = t.id
    WHERE u.id = auth.uid() AND t.is_test_site = true
  )
$$;

-- Drop existing restrictive policies on tenants table and add new one
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

-- Allow system admins and test site users to view all tenants, others see only their own
CREATE POLICY "Users can view tenants based on role"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add policy for system admins and test site users to view all users (for stats)
CREATE POLICY "System admins and test site users can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add policy for system admins and test site users to view all assets
CREATE POLICY "System admins and test site users can view all assets"
ON public.assets
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all work orders
CREATE POLICY "System admins and test site users can view all work orders"
ON public.work_orders
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all locations
CREATE POLICY "System admins and test site users can view all locations"
ON public.locations
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all inventory parts
CREATE POLICY "System admins and test site users can view all inventory"
ON public.inventory_parts
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add policy for system admins and test site users to view all PM schedules
CREATE POLICY "System admins and test site users can view all PM schedules"
ON public.preventive_maintenance_schedules
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all service contracts
CREATE POLICY "System admins and test site users can view all service contracts"
ON public.service_contracts
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add policy for system admins and test site users to view all departments
CREATE POLICY "System admins and test site users can view all departments"
ON public.departments
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add policy for system admins and test site users to view all categories
CREATE POLICY "System admins and test site users can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all location levels
CREATE POLICY "System admins and test site users can view all location levels"
ON public.location_levels
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = get_current_user_tenant_id()
);

-- Add policy for system admins and test site users to view all program settings
CREATE POLICY "System admins and test site users can view all program settings"
ON public.program_settings
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Allow system admins to update tenants (for toggling is_test_site)
CREATE POLICY "System admins can update tenants"
ON public.tenants
FOR UPDATE
TO authenticated
USING (public.is_system_admin() OR public.is_test_site_user())
WITH CHECK (public.is_system_admin() OR public.is_test_site_user());