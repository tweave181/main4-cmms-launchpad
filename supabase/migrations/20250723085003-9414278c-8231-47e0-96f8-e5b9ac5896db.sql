
-- Add service_contract_id column to assets table
ALTER TABLE public.assets 
ADD COLUMN service_contract_id uuid REFERENCES public.service_contracts(id);

-- Create index for better performance
CREATE INDEX idx_assets_service_contract_id 
ON public.assets(service_contract_id);
