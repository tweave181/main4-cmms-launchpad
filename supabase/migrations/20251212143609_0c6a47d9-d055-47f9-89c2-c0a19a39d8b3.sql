-- Function to get all system admin users across all tenants
CREATE OR REPLACE FUNCTION public.admin_get_all_system_admins()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  email TEXT,
  tenant_id UUID,
  tenant_name TEXT,
  role_assigned_at TIMESTAMPTZ,
  assigned_by UUID,
  assigned_by_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only system admins or test site users can call this
  IF NOT (public.is_system_admin() OR public.is_test_site_user()) THEN
    RAISE EXCEPTION 'Access denied: System admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    ur.user_id,
    u.name as user_name,
    u.email,
    u.tenant_id,
    t.name as tenant_name,
    ur.created_at as role_assigned_at,
    ur.created_by as assigned_by,
    creator.name as assigned_by_name
  FROM public.user_roles ur
  JOIN public.users u ON ur.user_id = u.id
  JOIN public.tenants t ON u.tenant_id = t.id
  LEFT JOIN public.users creator ON ur.created_by = creator.id
  WHERE ur.role = 'system_admin'
  ORDER BY ur.created_at DESC;
END;
$$;