-- Create addresses table
CREATE TABLE public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  address_line_3 TEXT,
  town_or_city TEXT,
  county_or_state TEXT,
  postcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for addresses
CREATE POLICY "Users can view addresses in their tenant" 
ON public.addresses 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create addresses in their tenant" 
ON public.addresses 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update addresses in their tenant" 
ON public.addresses 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete addresses in their tenant" 
ON public.addresses 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id());

-- Add foreign key constraint to addresses table
ALTER TABLE public.addresses 
ADD CONSTRAINT addresses_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Add updated_at trigger for addresses
CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add company_address_id to company_details table
ALTER TABLE public.company_details 
ADD COLUMN company_address_id UUID;

-- Add foreign key constraint
ALTER TABLE public.company_details 
ADD CONSTRAINT company_details_company_address_id_fkey 
FOREIGN KEY (company_address_id) REFERENCES public.addresses(id);

-- Add index for better performance
CREATE INDEX idx_addresses_tenant_id ON public.addresses(tenant_id);
CREATE INDEX idx_company_details_company_address_id ON public.company_details(company_address_id);