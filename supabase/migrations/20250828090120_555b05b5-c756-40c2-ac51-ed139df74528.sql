-- Add company website and description fields
ALTER TABLE public.company_details
  ADD COLUMN IF NOT EXISTS company_website text NULL,
  ADD COLUMN IF NOT EXISTS company_description text NULL;

-- Add length constraint on description
ALTER TABLE public.company_details
  ADD CONSTRAINT company_description_len 
  CHECK (company_description IS NULL OR length(company_description) <= 4000);