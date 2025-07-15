-- Create enum for contract status
CREATE TYPE contract_status AS ENUM ('Active', 'Expired', 'Terminated', 'Pending Review');

-- Create service_contracts table
CREATE TABLE public.service_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  vendor_name text NOT NULL,
  contract_title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status contract_status NOT NULL DEFAULT 'Active',
  contract_cost numeric,
  visit_count integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant-based access
CREATE POLICY "Users can view service contracts in their tenant"
ON public.service_contracts
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create service contracts in their tenant"
ON public.service_contracts
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update service contracts in their tenant"
ON public.service_contracts
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete service contracts in their tenant"
ON public.service_contracts
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_service_contracts_updated_at
BEFORE UPDATE ON public.service_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();