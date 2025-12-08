-- Drop the old global unique constraint on name
ALTER TABLE spare_parts_categories DROP CONSTRAINT IF EXISTS spare_parts_categories_name_key;

-- Add a new composite unique constraint for tenant isolation
ALTER TABLE spare_parts_categories 
ADD CONSTRAINT spare_parts_categories_tenant_name_unique 
UNIQUE (tenant_id, name);