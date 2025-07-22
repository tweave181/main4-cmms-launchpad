
-- Clear previous category assignments to start fresh
UPDATE public.asset_tag_prefixes 
SET category_id = NULL;

-- Update prefixes with exact description matches first (highest priority)
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = asset_tag_prefixes.description 
  AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = asset_tag_prefixes.description 
  AND tenant_id = asset_tag_prefixes.tenant_id
);

-- Update remaining prefixes based on common patterns in descriptions
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Equipment' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  UPPER(description) LIKE '%EQUIPMENT%' OR
  UPPER(description) LIKE '%MACHINE%' OR
  UPPER(description) LIKE '%TOOL%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'IT Assets' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  UPPER(description) LIKE '%COMPUTER%' OR
  UPPER(description) LIKE '%SERVER%' OR
  UPPER(description) LIKE '%IT%' OR
  UPPER(description) LIKE '%LAPTOP%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Vehicles' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  UPPER(description) LIKE '%VEHICLE%' OR
  UPPER(description) LIKE '%CAR%' OR
  UPPER(description) LIKE '%TRUCK%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Furniture' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  UPPER(description) LIKE '%FURNITURE%' OR
  UPPER(description) LIKE '%DESK%' OR
  UPPER(description) LIKE '%CHAIR%'
);

UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Tools' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND (
  UPPER(description) LIKE '%TOOLS%'
);

-- For any remaining prefixes without categories, assign them to Equipment as default
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Equipment' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL;
