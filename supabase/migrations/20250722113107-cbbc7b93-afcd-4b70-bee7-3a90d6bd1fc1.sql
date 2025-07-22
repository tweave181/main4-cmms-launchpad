
-- Update existing asset tag prefixes to assign them to appropriate categories
-- This will link prefixes to categories based on common naming patterns

-- Update prefixes that likely belong to Equipment category
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
  UPPER(description) LIKE '%TOOL%' OR
  prefix_letter IN ('E', 'M', 'T')
);

-- Update prefixes that likely belong to IT Assets category
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
  UPPER(description) LIKE '%LAPTOP%' OR
  prefix_letter IN ('C', 'I', 'S')
);

-- Update prefixes that likely belong to Vehicles category
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
  UPPER(description) LIKE '%TRUCK%' OR
  prefix_letter = 'V'
);

-- Update prefixes that likely belong to Furniture category
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
  UPPER(description) LIKE '%CHAIR%' OR
  prefix_letter = 'F'
);

-- For any remaining prefixes without categories, assign them to Equipment as default
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = 'Equipment' AND tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL;
