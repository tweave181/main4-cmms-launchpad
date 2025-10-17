-- Add asset hierarchy fields to assets table
ALTER TABLE public.assets 
ADD COLUMN parent_asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
ADD COLUMN asset_level integer DEFAULT 1 CHECK (asset_level BETWEEN 1 AND 3),
ADD COLUMN asset_type text DEFAULT 'unit' CHECK (asset_type IN ('unit', 'component', 'consumable'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_parent ON public.assets(parent_asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_level ON public.assets(asset_level);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);

-- Set default values for existing assets (all become units at level 1)
UPDATE public.assets 
SET asset_level = 1, 
    asset_type = 'unit'
WHERE asset_level IS NULL OR asset_type IS NULL;

-- Create view for asset hierarchy queries
CREATE OR REPLACE VIEW public.asset_hierarchy AS
WITH RECURSIVE asset_tree AS (
  -- Root level assets (units)
  SELECT 
    id, 
    name, 
    parent_asset_id, 
    asset_level, 
    asset_type,
    tenant_id,
    ARRAY[id] as path,
    name::text as full_path,
    1 as depth
  FROM public.assets 
  WHERE parent_asset_id IS NULL
  
  UNION ALL
  
  -- Child assets
  SELECT 
    a.id, 
    a.name, 
    a.parent_asset_id, 
    a.asset_level, 
    a.asset_type,
    a.tenant_id,
    at.path || a.id,
    at.full_path || ' > ' || a.name,
    at.depth + 1
  FROM public.assets a
  INNER JOIN asset_tree at ON a.parent_asset_id = at.id
)
SELECT * FROM asset_tree;

-- Add helpful comment
COMMENT ON COLUMN public.assets.parent_asset_id IS 'References parent asset for hierarchy: Units > Components > Consumables';
COMMENT ON COLUMN public.assets.asset_level IS 'Hierarchy level: 1=Unit, 2=Component, 3=Consumable';
COMMENT ON COLUMN public.assets.asset_type IS 'Asset type: unit, component, or consumable';