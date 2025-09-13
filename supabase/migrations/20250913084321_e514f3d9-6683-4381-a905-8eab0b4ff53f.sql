-- Add address_id column to service_contracts table to link contracts to addresses
ALTER TABLE public.service_contracts 
ADD COLUMN address_id UUID REFERENCES public.addresses(id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.service_contracts.address_id IS 'Links service contract to a specific address where services are provided';