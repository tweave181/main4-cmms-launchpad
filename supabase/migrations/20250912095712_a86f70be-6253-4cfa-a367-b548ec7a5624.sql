-- Add is_primary column to address_contacts
ALTER TABLE public.address_contacts 
ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

-- Create unique index to ensure only one primary contact per address
CREATE UNIQUE INDEX ux_address_contacts_primary 
ON public.address_contacts(address_id) 
WHERE is_primary = true;

-- Add comment to explain the constraint
COMMENT ON INDEX ux_address_contacts_primary IS 'Ensures only one primary contact per address';