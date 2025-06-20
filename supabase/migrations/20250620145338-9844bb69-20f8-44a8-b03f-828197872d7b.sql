
-- Create the company_details table
CREATE TABLE public.company_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT[] NOT NULL DEFAULT '{}', -- Array to support multiple types
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Add RLS policies for company_details
ALTER TABLE public.company_details ENABLE ROW LEVEL SECURITY;

-- Policy for selecting company details (users in same tenant)
CREATE POLICY "Users can view company details in their tenant" 
  ON public.company_details 
  FOR SELECT 
  USING (tenant_id = get_current_user_tenant_id());

-- Policy for inserting company details (authenticated users)
CREATE POLICY "Users can create company details in their tenant" 
  ON public.company_details 
  FOR INSERT 
  WITH CHECK (tenant_id = get_current_user_tenant_id());

-- Policy for updating company details (authenticated users)
CREATE POLICY "Users can update company details in their tenant" 
  ON public.company_details 
  FOR UPDATE 
  USING (tenant_id = get_current_user_tenant_id());

-- Policy for deleting company details (authenticated users)
CREATE POLICY "Users can delete company details in their tenant" 
  ON public.company_details 
  FOR DELETE 
  USING (tenant_id = get_current_user_tenant_id());

-- Add index for better performance
CREATE INDEX idx_company_details_tenant_type ON public.company_details(tenant_id, type);
CREATE INDEX idx_company_details_name ON public.company_details(company_name);

-- Add trigger for updated_at
CREATE TRIGGER update_company_details_updated_at 
  BEFORE UPDATE ON public.company_details 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add manufacturer_company_id to assets table
ALTER TABLE public.assets 
ADD COLUMN manufacturer_company_id UUID REFERENCES public.company_details(id);

-- Add contractor fields to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN assigned_to_contractor BOOLEAN DEFAULT false,
ADD COLUMN contractor_company_id UUID REFERENCES public.company_details(id);
