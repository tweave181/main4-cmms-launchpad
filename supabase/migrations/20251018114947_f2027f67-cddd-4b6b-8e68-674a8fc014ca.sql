-- Add inventory_type enum type
CREATE TYPE inventory_type AS ENUM ('spare_parts', 'consumables', 'tools', 'supplies', 'materials');

-- Add inventory_type column to inventory_parts table
ALTER TABLE public.inventory_parts 
ADD COLUMN inventory_type inventory_type NOT NULL DEFAULT 'spare_parts';

-- Add index for better query performance
CREATE INDEX idx_inventory_parts_inventory_type ON public.inventory_parts(inventory_type);

-- Add comment for documentation
COMMENT ON COLUMN public.inventory_parts.inventory_type IS 'Type/category of inventory item: spare_parts, consumables, tools, supplies, or materials';