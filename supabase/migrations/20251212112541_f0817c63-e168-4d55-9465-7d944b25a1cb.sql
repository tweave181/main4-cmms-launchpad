-- Part 1: Update RLS policies to remove is_system_admin() from operational tables
-- System admins will now see only their tenant's data on operational pages

-- Categories - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all categories" ON public.categories;
CREATE POLICY "Users can view categories in own tenant" ON public.categories
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Assets - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all assets" ON public.assets;
CREATE POLICY "Users can view assets in own tenant" ON public.assets
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Departments - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all departments" ON public.departments;
CREATE POLICY "Users can view departments in own tenant" ON public.departments
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Locations - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all locations" ON public.locations;
CREATE POLICY "Users can view locations in own tenant" ON public.locations
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Location Levels - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all location levels" ON public.location_levels;
CREATE POLICY "Users can view location levels in own tenant" ON public.location_levels
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Inventory Parts - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all inventory" ON public.inventory_parts;
CREATE POLICY "Users can view inventory in own tenant" ON public.inventory_parts
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Users table - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all users" ON public.users;
CREATE POLICY "Users can view users in own tenant" ON public.users
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Work Orders - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all work orders" ON public.work_orders;
CREATE POLICY "Users can view work orders in own tenant" ON public.work_orders
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- PM Schedules - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all PM schedules" ON public.preventive_maintenance_schedules;
CREATE POLICY "Users can view PM schedules in own tenant" ON public.preventive_maintenance_schedules
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Service Contracts - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all contracts" ON public.service_contracts;
CREATE POLICY "Users can view contracts in own tenant" ON public.service_contracts
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Program Settings - remove is_system_admin() bypass
DROP POLICY IF EXISTS "System admins can view all program settings" ON public.program_settings;
CREATE POLICY "Users can view program settings in own tenant" ON public.program_settings
  FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Part 2: Create SECURITY DEFINER function for System Admin cross-tenant queries
CREATE OR REPLACE FUNCTION public.admin_get_all_tenants_stats()
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_at TIMESTAMPTZ,
  is_test_site BOOLEAN,
  user_count BIGINT,
  asset_count BIGINT,
  work_order_count BIGINT,
  open_work_order_count BIGINT,
  location_count BIGINT,
  inventory_count BIGINT,
  pm_schedule_count BIGINT,
  contract_count BIGINT,
  has_defaults BOOLEAN,
  departments_count BIGINT,
  categories_count BIGINT,
  location_levels_count BIGINT,
  job_titles_count BIGINT,
  checklist_items_count BIGINT,
  checklist_records_count BIGINT,
  addresses_count BIGINT,
  has_settings BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only system admins or test site users can access cross-tenant data
  IF NOT (public.is_system_admin() OR public.is_test_site_user()) THEN
    RAISE EXCEPTION 'Access denied: System admin role or test site access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.created_at,
    t.is_test_site,
    COALESCE((SELECT COUNT(*) FROM public.users u WHERE u.tenant_id = t.id), 0) as user_count,
    COALESCE((SELECT COUNT(*) FROM public.assets a WHERE a.tenant_id = t.id), 0) as asset_count,
    COALESCE((SELECT COUNT(*) FROM public.work_orders wo WHERE wo.tenant_id = t.id), 0) as work_order_count,
    COALESCE((SELECT COUNT(*) FROM public.work_orders wo WHERE wo.tenant_id = t.id AND wo.status IN ('Open', 'In Progress')), 0) as open_work_order_count,
    COALESCE((SELECT COUNT(*) FROM public.locations l WHERE l.tenant_id = t.id), 0) as location_count,
    COALESCE((SELECT COUNT(*) FROM public.inventory_parts ip WHERE ip.tenant_id = t.id), 0) as inventory_count,
    COALESCE((SELECT COUNT(*) FROM public.preventive_maintenance_schedules pms WHERE pms.tenant_id = t.id), 0) as pm_schedule_count,
    COALESCE((SELECT COUNT(*) FROM public.service_contracts sc WHERE sc.tenant_id = t.id), 0) as contract_count,
    public.tenant_has_defaults(t.id) as has_defaults,
    COALESCE((SELECT COUNT(*) FROM public.departments d WHERE d.tenant_id = t.id), 0) as departments_count,
    COALESCE((SELECT COUNT(*) FROM public.categories c WHERE c.tenant_id = t.id), 0) as categories_count,
    COALESCE((SELECT COUNT(*) FROM public.location_levels ll WHERE ll.tenant_id = t.id), 0) as location_levels_count,
    COALESCE((SELECT COUNT(*) FROM public.job_titles jt WHERE jt.tenant_id = t.id), 0) as job_titles_count,
    COALESCE((SELECT COUNT(*) FROM public.checklist_item_templates cit WHERE cit.tenant_id = t.id), 0) as checklist_items_count,
    COALESCE((SELECT COUNT(*) FROM public.checklist_records cr WHERE cr.tenant_id = t.id), 0) as checklist_records_count,
    COALESCE((SELECT COUNT(*) FROM public.addresses addr WHERE addr.tenant_id = t.id), 0) as addresses_count,
    EXISTS(SELECT 1 FROM public.program_settings ps WHERE ps.tenant_id = t.id) as has_settings
  FROM public.tenants t
  ORDER BY t.created_at DESC;
END;
$$;

-- Part 3: Create function for assigning system_admin role
CREATE OR REPLACE FUNCTION public.assign_system_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only existing system admins can assign this role
  IF NOT public.is_system_admin() THEN
    RAISE EXCEPTION 'Access denied: Only system admins can assign system admin role';
  END IF;
  
  -- Verify target user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Insert the role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (target_user_id, 'system_admin', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Part 4: Create function to remove system_admin role
CREATE OR REPLACE FUNCTION public.remove_system_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only existing system admins can remove this role
  IF NOT public.is_system_admin() THEN
    RAISE EXCEPTION 'Access denied: Only system admins can remove system admin role';
  END IF;
  
  -- Prevent removing your own system_admin role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove your own system admin role';
  END IF;
  
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = 'system_admin';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_get_all_tenants_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_system_admin_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_system_admin_role(UUID) TO authenticated;