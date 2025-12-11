-- Fix RLS infinite recursion by using get_current_user_tenant_id() instead of inline subqueries

-- Fix users table policy
DROP POLICY IF EXISTS "System admins and test site users can view all users" ON public.users;
CREATE POLICY "System admins and test site users can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix tenants table policy
DROP POLICY IF EXISTS "Users can view tenants based on role" ON public.tenants;
CREATE POLICY "Users can view tenants based on role"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  id = public.get_current_user_tenant_id()
);

-- Fix inventory_parts table policy
DROP POLICY IF EXISTS "System admins and test site users can view all inventory" ON public.inventory_parts;
CREATE POLICY "System admins and test site users can view all inventory"
ON public.inventory_parts
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix departments table policy
DROP POLICY IF EXISTS "System admins and test site users can view all departments" ON public.departments;
CREATE POLICY "System admins and test site users can view all departments"
ON public.departments
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix program_settings table policy
DROP POLICY IF EXISTS "System admins and test site users can view all program settings" ON public.program_settings;
CREATE POLICY "System admins and test site users can view all program settings"
ON public.program_settings
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix assets table policy
DROP POLICY IF EXISTS "System admins and test site users can view all assets" ON public.assets;
CREATE POLICY "System admins and test site users can view all assets"
ON public.assets
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix work_orders table policy
DROP POLICY IF EXISTS "System admins and test site users can view all work orders" ON public.work_orders;
CREATE POLICY "System admins and test site users can view all work orders"
ON public.work_orders
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix locations table policy
DROP POLICY IF EXISTS "System admins and test site users can view all locations" ON public.locations;
CREATE POLICY "System admins and test site users can view all locations"
ON public.locations
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix preventive_maintenance_schedules table policy
DROP POLICY IF EXISTS "System admins and test site users can view all PM schedules" ON public.preventive_maintenance_schedules;
CREATE POLICY "System admins and test site users can view all PM schedules"
ON public.preventive_maintenance_schedules
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix service_contracts table policy
DROP POLICY IF EXISTS "System admins and test site users can view all service contracts" ON public.service_contracts;
CREATE POLICY "System admins and test site users can view all service contracts"
ON public.service_contracts
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix categories table policy
DROP POLICY IF EXISTS "System admins and test site users can view all categories" ON public.categories;
CREATE POLICY "System admins and test site users can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix location_levels table policy
DROP POLICY IF EXISTS "System admins and test site users can view all location levels" ON public.location_levels;
CREATE POLICY "System admins and test site users can view all location levels"
ON public.location_levels
FOR SELECT
TO authenticated
USING (
  public.is_system_admin() OR 
  public.is_test_site_user() OR
  tenant_id = public.get_current_user_tenant_id()
);

-- Fix tenants update policy
DROP POLICY IF EXISTS "System admins can update tenants" ON public.tenants;
CREATE POLICY "System admins can update tenants"
ON public.tenants
FOR UPDATE
TO authenticated
USING (public.is_system_admin() OR public.is_test_site_user())
WITH CHECK (public.is_system_admin() OR public.is_test_site_user());