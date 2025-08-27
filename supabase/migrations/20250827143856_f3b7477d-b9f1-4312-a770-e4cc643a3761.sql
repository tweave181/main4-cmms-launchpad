-- Make company_address_id nullable and drop any constraint requiring it
ALTER TABLE public.company_details ALTER COLUMN company_address_id DROP NOT NULL;

-- Drop the constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_requires_address'
  ) THEN
    ALTER TABLE public.company_details DROP CONSTRAINT company_requires_address;
  END IF;
END$$;