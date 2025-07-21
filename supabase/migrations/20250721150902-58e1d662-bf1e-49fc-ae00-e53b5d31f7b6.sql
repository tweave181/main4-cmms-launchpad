-- Create contract_lines table for service contract line items
CREATE TABLE public.contract_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contract_id uuid NOT NULL REFERENCES public.service_contracts(id) ON DELETE CASCADE,
  line_description text NOT NULL,
  frequency text,
  sla text,
  cost_per_line numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view contract lines in their tenant" 
ON public.contract_lines 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create contract lines in their tenant" 
ON public.contract_lines 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update contract lines in their tenant" 
ON public.contract_lines 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete contract lines in their tenant" 
ON public.contract_lines 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id());

-- Create index for better performance
CREATE INDEX idx_contract_lines_contract_id ON public.contract_lines(contract_id);
CREATE INDEX idx_contract_lines_tenant_id ON public.contract_lines(tenant_id);

-- Add trigger for updated_at
CREATE TRIGGER update_contract_lines_updated_at
  BEFORE UPDATE ON public.contract_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();