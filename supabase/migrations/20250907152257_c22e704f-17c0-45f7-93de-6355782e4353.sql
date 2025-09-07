-- Remove company_address_id column from company_details table
ALTER TABLE public.company_details DROP COLUMN IF EXISTS company_address_id;