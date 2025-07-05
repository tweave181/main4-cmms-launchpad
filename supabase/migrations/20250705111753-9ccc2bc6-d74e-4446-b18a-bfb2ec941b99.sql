-- Create locations table with auto-generated location codes
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  location_code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT unique_location_code_per_tenant UNIQUE (tenant_id, location_code),
  CONSTRAINT unique_location_name_per_tenant UNIQUE (tenant_id, name),
  CONSTRAINT location_code_length CHECK (length(location_code) >= 2 AND length(location_code) <= 5),
  CONSTRAINT location_code_format CHECK (location_code ~ '^[A-Z]+$')
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view locations in their tenant" 
ON public.locations 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Admins can create locations in their tenant" 
ON public.locations 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can update locations in their tenant" 
ON public.locations 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can delete locations in their tenant" 
ON public.locations 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Function to generate location code from name
CREATE OR REPLACE FUNCTION public.generate_location_code(location_name TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  clean_name TEXT;
BEGIN
  -- Remove non-alphabetic characters and convert to uppercase
  clean_name := UPPER(REGEXP_REPLACE(location_name, '[^A-Za-z]', '', 'g'));
  
  -- Take first 3 characters, or less if name is shorter
  code := LEFT(clean_name, 3);
  
  -- Ensure minimum 2 characters
  IF LENGTH(code) < 2 THEN
    -- If name is too short, pad with 'X'
    code := RPAD(code, 2, 'X');
  END IF;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique location code
CREATE OR REPLACE FUNCTION public.ensure_unique_location_code(p_tenant_id UUID, p_name TEXT, p_existing_code TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from name
  base_code := public.generate_location_code(p_name);
  final_code := base_code;
  
  -- If an existing code is provided, use it
  IF p_existing_code IS NOT NULL AND LENGTH(p_existing_code) >= 2 AND p_existing_code ~ '^[A-Z]+$' THEN
    final_code := p_existing_code;
  END IF;
  
  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (
    SELECT 1 FROM public.locations 
    WHERE tenant_id = p_tenant_id AND location_code = final_code
  ) LOOP
    final_code := base_code || counter::TEXT;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 999 THEN
      RAISE EXCEPTION 'Unable to generate unique location code for name: %', p_name;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate location code
CREATE OR REPLACE FUNCTION public.set_location_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate code if not provided or empty
  IF NEW.location_code IS NULL OR TRIM(NEW.location_code) = '' THEN
    NEW.location_code := public.ensure_unique_location_code(NEW.tenant_id, NEW.name);
  ELSE
    -- Validate manually provided code
    IF LENGTH(NEW.location_code) < 2 OR LENGTH(NEW.location_code) > 5 THEN
      RAISE EXCEPTION 'Location code must be between 2 and 5 characters';
    END IF;
    
    IF NEW.location_code !~ '^[A-Z]+$' THEN
      RAISE EXCEPTION 'Location code must contain only uppercase letters';
    END IF;
    
    -- Ensure uniqueness for manually provided codes
    IF EXISTS (
      SELECT 1 FROM public.locations 
      WHERE tenant_id = NEW.tenant_id 
        AND location_code = NEW.location_code 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Location code % already exists in this tenant', NEW.location_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_set_location_code
  BEFORE INSERT OR UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_location_code();

-- Create updated_at trigger
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing location data from assets table
INSERT INTO public.locations (tenant_id, name, location_code)
SELECT DISTINCT 
  a.tenant_id,
  a.location as name,
  public.ensure_unique_location_code(a.tenant_id, a.location) as location_code
FROM public.assets a
WHERE a.location IS NOT NULL 
  AND TRIM(a.location) != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.locations l 
    WHERE l.tenant_id = a.tenant_id AND l.name = a.location
  );

-- Add location_id column to assets table
ALTER TABLE public.assets ADD COLUMN location_id UUID;

-- Create foreign key constraint
ALTER TABLE public.assets ADD CONSTRAINT assets_location_id_fkey 
  FOREIGN KEY (location_id) REFERENCES public.locations(id);

-- Update assets to reference new locations table
UPDATE public.assets 
SET location_id = l.id
FROM public.locations l
WHERE assets.tenant_id = l.tenant_id 
  AND assets.location = l.name;