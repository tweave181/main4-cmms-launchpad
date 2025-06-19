
-- Create asset_tag_prefixes table
CREATE TABLE public.asset_tag_prefixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  prefix_letter TEXT NOT NULL CHECK (prefix_letter ~ '^[A-Z]$'),
  number_code TEXT NOT NULL CHECK (number_code ~ '^[0-9]{3}$'),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, prefix_letter, number_code)
);

-- Add trigger for updated_at on asset_tag_prefixes
CREATE TRIGGER update_asset_tag_prefixes_updated_at 
  BEFORE UPDATE ON public.asset_tag_prefixes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on asset_tag_prefixes table
ALTER TABLE public.asset_tag_prefixes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_tag_prefixes
CREATE POLICY "Users can view asset tag prefixes in their tenant" 
  ON public.asset_tag_prefixes 
  FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert asset tag prefixes in their tenant" 
  ON public.asset_tag_prefixes 
  FOR INSERT 
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update asset tag prefixes in their tenant" 
  ON public.asset_tag_prefixes 
  FOR UPDATE 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete asset tag prefixes in their tenant" 
  ON public.asset_tag_prefixes 
  FOR DELETE 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Insert some sample data for testing
INSERT INTO public.asset_tag_prefixes (tenant_id, prefix_letter, number_code, description) VALUES
-- Get a sample tenant_id from existing tenants
((SELECT id FROM public.tenants LIMIT 1), 'E', '001', 'Chillers'),
((SELECT id FROM public.tenants LIMIT 1), 'E', '002', 'Boilers'),
((SELECT id FROM public.tenants LIMIT 1), 'E', '003', 'Generators'),
((SELECT id FROM public.tenants LIMIT 1), 'M', '001', 'Motors'),
((SELECT id FROM public.tenants LIMIT 1), 'P', '001', 'Pumps'),
((SELECT id FROM public.tenants LIMIT 1), 'V', '001', 'Valves');
