-- Function to check if tenant has been initialized with default data
CREATE OR REPLACE FUNCTION public.tenant_has_defaults(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM departments WHERE tenant_id = p_tenant_id
  ) AND EXISTS (
    SELECT 1 FROM categories WHERE tenant_id = p_tenant_id
  ) AND EXISTS (
    SELECT 1 FROM location_levels WHERE tenant_id = p_tenant_id
  ) AND EXISTS (
    SELECT 1 FROM program_settings WHERE tenant_id = p_tenant_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.tenant_has_defaults(uuid) TO authenticated;