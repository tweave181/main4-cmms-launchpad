-- Add foreign key constraint for company_id in addresses table
ALTER TABLE public.addresses 
ADD CONSTRAINT addresses_company_id_fkey 
FOREIGN KEY (company_id) 
REFERENCES public.company_details(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_company_id ON public.addresses(company_id);