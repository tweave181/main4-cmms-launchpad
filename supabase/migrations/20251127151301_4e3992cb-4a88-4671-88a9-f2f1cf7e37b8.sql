-- Drop existing tenant-specific policies on frequency_types
DROP POLICY IF EXISTS "Users can view frequency types in their tenant" ON frequency_types;
DROP POLICY IF EXISTS "Admins can create frequency types in their tenant" ON frequency_types;
DROP POLICY IF EXISTS "Admins can update frequency types in their tenant" ON frequency_types;
DROP POLICY IF EXISTS "Admins can delete frequency types in their tenant" ON frequency_types;

-- Make tenant_id nullable since frequency_types are now global
ALTER TABLE frequency_types ALTER COLUMN tenant_id DROP NOT NULL;

-- Create new global RLS policies
CREATE POLICY "Authenticated users can view all frequency types"
ON frequency_types FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create frequency types"
ON frequency_types FOR INSERT
TO authenticated
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update frequency types"
ON frequency_types FOR UPDATE
TO authenticated
USING (is_current_user_admin());

CREATE POLICY "Admins can delete frequency types"
ON frequency_types FOR DELETE
TO authenticated
USING (is_current_user_admin());

-- Consolidate duplicate frequency types - keep one of each name with lowest sort_order
DELETE FROM frequency_types f1
WHERE EXISTS (
  SELECT 1 FROM frequency_types f2
  WHERE f2.name = f1.name
  AND f2.sort_order < f1.sort_order
)
OR EXISTS (
  SELECT 1 FROM frequency_types f2
  WHERE f2.name = f1.name
  AND f2.sort_order = f1.sort_order
  AND f2.id < f1.id
);

-- Update remaining records to have null tenant_id (global data)
UPDATE frequency_types SET tenant_id = NULL;