-- Add tenant_id column to spare_parts_categories table
ALTER TABLE spare_parts_categories 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Update existing records to link them to a tenant (if any exist)
-- This will set tenant_id based on the user who created them
UPDATE spare_parts_categories spc
SET tenant_id = u.tenant_id
FROM users u
WHERE spc.created_by = u.id
AND spc.tenant_id IS NULL;

-- For any remaining records without tenant_id, set to first available tenant
UPDATE spare_parts_categories
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Make tenant_id NOT NULL after populating data
ALTER TABLE spare_parts_categories 
ALTER COLUMN tenant_id SET NOT NULL;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON spare_parts_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON spare_parts_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON spare_parts_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON spare_parts_categories;

-- Create proper tenant-scoped RLS policies
CREATE POLICY "Users can view spare parts categories in their tenant"
ON spare_parts_categories
FOR SELECT
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create spare parts categories in their tenant"
ON spare_parts_categories
FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update spare parts categories in their tenant"
ON spare_parts_categories
FOR UPDATE
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete spare parts categories in their tenant"
ON spare_parts_categories
FOR DELETE
USING (tenant_id = get_current_user_tenant_id());