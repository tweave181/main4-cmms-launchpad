-- Fix 1: Remove the overly permissive "Anyone can validate invitations" policy
-- The validate_tenant_invitation function already provides secure validation
DROP POLICY IF EXISTS "Anyone can validate invitations" ON public.tenant_invitations;

-- Fix 2: Recreate asset_hierarchy view with security_invoker to respect RLS
DROP VIEW IF EXISTS public.asset_hierarchy;

CREATE OR REPLACE VIEW public.asset_hierarchy
WITH (security_invoker = true)
AS
WITH RECURSIVE asset_tree AS (
  -- Base case: root assets (no parent)
  SELECT 
    id,
    name,
    parent_asset_id,
    tenant_id,
    asset_type,
    asset_level,
    ARRAY[id] AS path,
    name AS full_path,
    0 AS depth
  FROM public.assets
  WHERE parent_asset_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child assets
  SELECT 
    a.id,
    a.name,
    a.parent_asset_id,
    a.tenant_id,
    a.asset_type,
    a.asset_level,
    at.path || a.id,
    at.full_path || ' > ' || a.name,
    at.depth + 1
  FROM public.assets a
  INNER JOIN asset_tree at ON a.parent_asset_id = at.id
)
SELECT * FROM asset_tree;