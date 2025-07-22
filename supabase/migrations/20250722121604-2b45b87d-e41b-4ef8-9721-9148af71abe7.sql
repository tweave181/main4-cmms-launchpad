-- Temporarily disable the audit log trigger
DROP TRIGGER IF EXISTS log_asset_prefix_changes_trigger ON public.asset_tag_prefixes;

-- Link prefixes to categories with exact name matches
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = asset_tag_prefixes.description
  AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.name = asset_tag_prefixes.description
  AND c.tenant_id = asset_tag_prefixes.tenant_id
);

-- Re-enable the audit log trigger
CREATE TRIGGER log_asset_prefix_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.asset_tag_prefixes
  FOR EACH ROW EXECUTE FUNCTION log_asset_prefix_changes();