-- Fix cross-tenant data leakage: Remove is_test_site_user() from operational tables
-- Only is_system_admin() should have cross-tenant access, test site users see their own tenant data

-- Categories
DROP POLICY IF EXISTS "System admins and test site users can view all categories" ON public.categories;
CREATE POLICY "System admins can view all categories" ON public.categories
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Assets
DROP POLICY IF EXISTS "System admins and test site users can view all assets" ON public.assets;
CREATE POLICY "System admins can view all assets" ON public.assets
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Departments
DROP POLICY IF EXISTS "System admins and test site users can view all departments" ON public.departments;
CREATE POLICY "System admins can view all departments" ON public.departments
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Locations
DROP POLICY IF EXISTS "System admins and test site users can view all locations" ON public.locations;
CREATE POLICY "System admins can view all locations" ON public.locations
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Location Levels
DROP POLICY IF EXISTS "System admins and test site users can view all location levels" ON public.location_levels;
CREATE POLICY "System admins can view all location levels" ON public.location_levels
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Inventory Parts
DROP POLICY IF EXISTS "System admins and test site users can view all inventory" ON public.inventory_parts;
CREATE POLICY "System admins can view all inventory" ON public.inventory_parts
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Users table
DROP POLICY IF EXISTS "System admins and test site users can view all users" ON public.users;
CREATE POLICY "System admins can view all users" ON public.users
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Work Orders
DROP POLICY IF EXISTS "System admins and test site users can view all work orders" ON public.work_orders;
CREATE POLICY "System admins can view all work orders" ON public.work_orders
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- PM Schedules
DROP POLICY IF EXISTS "System admins and test site users can view all PM schedules" ON public.preventive_maintenance_schedules;
CREATE POLICY "System admins can view all PM schedules" ON public.preventive_maintenance_schedules
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Service Contracts
DROP POLICY IF EXISTS "System admins and test site users can view all contracts" ON public.service_contracts;
CREATE POLICY "System admins can view all contracts" ON public.service_contracts
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Program Settings
DROP POLICY IF EXISTS "System admins and test site users can view all program settings" ON public.program_settings;
CREATE POLICY "System admins can view all program settings" ON public.program_settings
  FOR SELECT USING (public.is_system_admin() OR tenant_id = public.get_current_user_tenant_id());

-- Keep is_test_site_user() ONLY on tenants table for System Admin access
-- (tenants table policy already correct from previous migration)