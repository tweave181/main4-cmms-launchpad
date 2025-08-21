-- Add quantity_required column to part_asset_associations
ALTER TABLE part_asset_associations
  ADD COLUMN quantity_required INTEGER NOT NULL DEFAULT 1;

-- Add validation constraint
ALTER TABLE part_asset_associations
  ADD CONSTRAINT chk_quantity_required CHECK (quantity_required >= 1);

-- Create unique constraint to prevent duplicate part-asset associations
CREATE UNIQUE INDEX IF NOT EXISTS ux_part_asset_associations 
ON part_asset_associations(asset_id, part_id);

-- Add foreign key constraints if they don't exist
ALTER TABLE part_asset_associations
  DROP CONSTRAINT IF EXISTS fk_part_asset_associations_asset_id;

ALTER TABLE part_asset_associations
  DROP CONSTRAINT IF EXISTS fk_part_asset_associations_part_id;

ALTER TABLE part_asset_associations
  ADD CONSTRAINT fk_part_asset_associations_asset_id 
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

ALTER TABLE part_asset_associations
  ADD CONSTRAINT fk_part_asset_associations_part_id 
  FOREIGN KEY (part_id) REFERENCES inventory_parts(id) ON DELETE CASCADE;