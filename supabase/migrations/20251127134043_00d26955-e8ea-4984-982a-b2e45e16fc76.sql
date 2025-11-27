-- Create frequency_types table
CREATE TABLE frequency_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for tenant_id and name
ALTER TABLE frequency_types
ADD CONSTRAINT frequency_types_tenant_name_unique UNIQUE (tenant_id, name);

-- Add index for better query performance
CREATE INDEX idx_frequency_types_tenant_id ON frequency_types(tenant_id);
CREATE INDEX idx_frequency_types_active ON frequency_types(tenant_id, is_active);

-- Enable RLS
ALTER TABLE frequency_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view frequency types in their tenant"
  ON frequency_types FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Admins can create frequency types in their tenant"
  ON frequency_types FOR INSERT
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can update frequency types in their tenant"
  ON frequency_types FOR UPDATE
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can delete frequency types in their tenant"
  ON frequency_types FOR DELETE
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_frequency_types_updated_at
  BEFORE UPDATE ON frequency_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default frequency types for all existing tenants
INSERT INTO frequency_types (tenant_id, name, description, sort_order)
SELECT 
  t.id as tenant_id,
  freq.name,
  freq.description,
  freq.sort_order
FROM tenants t
CROSS JOIN (
  VALUES 
    ('Daily', 'Maintenance required every day', 1),
    ('Weekly', 'Maintenance required every week', 2),
    ('Monthly', 'Maintenance required every month', 3),
    ('Quarterly', 'Maintenance required every quarter', 4),
    ('Six Monthly', 'Maintenance required every six months', 5),
    ('Yearly', 'Maintenance required every year', 6),
    ('Two Yearly', 'Maintenance required every two years', 7)
) AS freq(name, description, sort_order);