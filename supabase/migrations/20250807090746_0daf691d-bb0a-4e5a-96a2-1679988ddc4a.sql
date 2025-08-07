-- Create location_levels table
CREATE TABLE public.location_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Enable RLS
ALTER TABLE public.location_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for location_levels
CREATE POLICY "Users can view location levels in their tenant"
ON public.location_levels
FOR SELECT
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Admins can create location levels in their tenant"
ON public.location_levels
FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can update location levels in their tenant"
ON public.location_levels
FOR UPDATE
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can delete location levels in their tenant"
ON public.location_levels
FOR DELETE
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Add location_level_id to locations table
ALTER TABLE public.locations ADD COLUMN location_level_id UUID;

-- Create foreign key relationship
ALTER TABLE public.locations 
ADD CONSTRAINT fk_locations_location_level_id 
FOREIGN KEY (location_level_id) REFERENCES public.location_levels(id);

-- Create function to insert default location levels for a tenant
CREATE OR REPLACE FUNCTION public.insert_default_location_levels(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.location_levels (tenant_id, name, code) VALUES
    (p_tenant_id, 'Building', 'BLD'),
    (p_tenant_id, 'Floor', 'FLR'),
    (p_tenant_id, 'Room', 'RM'),
    (p_tenant_id, 'Zone', 'ZN'),
    (p_tenant_id, 'Area', 'AR'),
    (p_tenant_id, 'Department', 'DEPT');
END;
$$;

-- Insert default location levels for existing tenants
INSERT INTO public.location_levels (tenant_id, name, code)
SELECT DISTINCT 
  t.id as tenant_id,
  level_name.name,
  level_name.code
FROM public.tenants t
CROSS JOIN (
  VALUES 
    ('Building', 'BLD'),
    ('Floor', 'FLR'),
    ('Room', 'RM'),
    ('Zone', 'ZN'),
    ('Area', 'AR'),
    ('Department', 'DEPT')
) AS level_name(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM public.location_levels ll 
  WHERE ll.tenant_id = t.id
);

-- Update existing locations to use location_level_id
UPDATE public.locations 
SET location_level_id = (
  SELECT ll.id 
  FROM public.location_levels ll 
  WHERE ll.tenant_id = locations.tenant_id 
  AND ll.name = locations.location_level
  LIMIT 1
)
WHERE location_level IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_location_levels_updated_at
BEFORE UPDATE ON public.location_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();