-- Create program_settings table for tenant-specific configuration
CREATE TABLE public.program_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  country TEXT,
  currency TEXT,
  language TEXT,
  timezone TEXT,
  date_format TEXT,
  default_fiscal_year_start DATE,
  organization_name TEXT,
  system_contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one record per tenant
  UNIQUE(tenant_id)
);

-- Enable Row Level Security
ALTER TABLE public.program_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin users can view program settings in their tenant
CREATE POLICY "Admins can view program settings in their tenant"
ON public.program_settings
FOR SELECT
USING (
  tenant_id = get_current_user_tenant_id() 
  AND is_current_user_admin()
);

-- RLS Policy: Admin users can create program settings in their tenant
CREATE POLICY "Admins can create program settings in their tenant"
ON public.program_settings
FOR INSERT
WITH CHECK (
  tenant_id = get_current_user_tenant_id() 
  AND is_current_user_admin()
);

-- RLS Policy: Admin users can update program settings in their tenant
CREATE POLICY "Admins can update program settings in their tenant"
ON public.program_settings
FOR UPDATE
USING (
  tenant_id = get_current_user_tenant_id() 
  AND is_current_user_admin()
)
WITH CHECK (
  tenant_id = get_current_user_tenant_id() 
  AND is_current_user_admin()
);

-- RLS Policy: Admin users can delete program settings in their tenant
CREATE POLICY "Admins can delete program settings in their tenant"
ON public.program_settings
FOR DELETE
USING (
  tenant_id = get_current_user_tenant_id() 
  AND is_current_user_admin()
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_program_settings_updated_at
BEFORE UPDATE ON public.program_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();