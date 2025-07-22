
-- Create the categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Add RLS policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories in their tenant" 
  ON public.categories 
  FOR SELECT 
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create categories in their tenant" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update categories in their tenant" 
  ON public.categories 
  FOR UPDATE 
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete categories in their tenant" 
  ON public.categories 
  FOR DELETE 
  USING (tenant_id = get_current_user_tenant_id());

-- Add category_id foreign key to asset_tag_prefixes table
ALTER TABLE public.asset_tag_prefixes 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Add some default categories for existing tenants
INSERT INTO public.categories (tenant_id, name, description)
SELECT DISTINCT tenant_id, 'Equipment', 'General equipment and machinery' FROM public.asset_tag_prefixes
UNION ALL
SELECT DISTINCT tenant_id, 'Vehicles', 'Company vehicles and transportation' FROM public.asset_tag_prefixes
UNION ALL
SELECT DISTINCT tenant_id, 'IT Assets', 'Computers, servers, and IT equipment' FROM public.asset_tag_prefixes
UNION ALL
SELECT DISTINCT tenant_id, 'Furniture', 'Office furniture and fixtures' FROM public.asset_tag_prefixes
UNION ALL
SELECT DISTINCT tenant_id, 'Tools', 'Hand tools and power tools' FROM public.asset_tag_prefixes;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
