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

-- For any remaining unmatched prefixes, assign to Equipment if it exists
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Equipment' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL
AND EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.name = 'Equipment' AND c.tenant_id = asset_tag_prefixes.tenant_id
);