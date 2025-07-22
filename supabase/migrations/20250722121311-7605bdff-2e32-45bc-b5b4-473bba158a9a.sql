
-- Clear previous category assignments to start fresh
UPDATE public.asset_tag_prefixes 
SET category_id = NULL;

-- First, handle exact matches between description and category names (case-insensitive, trimmed)
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(asset_tag_prefixes.description))
  AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL;

-- Handle specific common mappings and variations
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'IT Assets' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  LOWER(TRIM(description)) IN ('it', 'computers', 'laptops', 'servers', 'technology', 'computer equipment') OR
  LOWER(TRIM(description)) LIKE '%computer%' OR
  LOWER(TRIM(description)) LIKE '%laptop%' OR
  LOWER(TRIM(description)) LIKE '%server%' OR
  LOWER(TRIM(description)) LIKE '%it %' OR
  LOWER(TRIM(description)) LIKE 'it %'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Vehicles' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  LOWER(TRIM(description)) IN ('vehicles', 'cars', 'trucks', 'transportation', 'fleet') OR
  LOWER(TRIM(description)) LIKE '%vehicle%' OR
  LOWER(TRIM(description)) LIKE '%car%' OR
  LOWER(TRIM(description)) LIKE '%truck%' OR
  LOWER(TRIM(description)) LIKE '%transport%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Equipment' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  LOWER(TRIM(description)) IN ('equipment', 'machinery', 'machine', 'machines') OR
  LOWER(TRIM(description)) LIKE '%equipment%' OR
  LOWER(TRIM(description)) LIKE '%machine%' OR
  LOWER(TRIM(description)) LIKE '%machinery%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Furniture' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  LOWER(TRIM(description)) IN ('furniture', 'desk', 'desks', 'chair', 'chairs', 'office furniture') OR
  LOWER(TRIM(description)) LIKE '%furniture%' OR
  LOWER(TRIM(description)) LIKE '%desk%' OR
  LOWER(TRIM(description)) LIKE '%chair%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Tools' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  LOWER(TRIM(description)) IN ('tools', 'tool', 'hand tools', 'power tools') OR
  LOWER(TRIM(description)) LIKE '%tool%'
);

-- For any remaining prefixes without categories, assign them to Equipment as default
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = 'Equipment' AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL;

-- Verify the results with a summary query
SELECT 
  c.name as category_name,
  COUNT(atp.id) as prefix_count,
  STRING_AGG(atp.description, ', ' ORDER BY atp.description) as descriptions
FROM public.asset_tag_prefixes atp
LEFT JOIN public.categories c ON c.id = atp.category_id
GROUP BY c.name
ORDER BY c.name;
