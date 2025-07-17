-- Add vendor company reference to service contracts table
ALTER TABLE public.service_contracts 
ADD COLUMN vendor_company_id uuid REFERENCES public.company_details(id);

-- Create index for better performance
CREATE INDEX idx_service_contracts_vendor_company_id 
ON public.service_contracts(vendor_company_id);

-- Update existing records to maintain data integrity (optional step for existing data)
-- This creates company records for existing vendor names if they don't exist
-- and links them to the contracts
INSERT INTO public.company_details (company_name, tenant_id, type)
SELECT DISTINCT 
  sc.vendor_name,
  sc.tenant_id,
  ARRAY['vendor']::text[]
FROM public.service_contracts sc
WHERE sc.vendor_name IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.company_details cd 
    WHERE cd.company_name = sc.vendor_name 
    AND cd.tenant_id = sc.tenant_id
  );

-- Link existing contracts to their corresponding company records
UPDATE public.service_contracts 
SET vendor_company_id = cd.id
FROM public.company_details cd
WHERE cd.company_name = service_contracts.vendor_name 
  AND cd.tenant_id = service_contracts.tenant_id;