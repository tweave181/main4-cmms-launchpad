-- Add missing company information fields to addresses table
ALTER TABLE public.addresses ADD COLUMN company_name text;
ALTER TABLE public.addresses ADD COLUMN contact_name text;
ALTER TABLE public.addresses ADD COLUMN phone text;
ALTER TABLE public.addresses ADD COLUMN email text;
ALTER TABLE public.addresses ADD COLUMN website text;
ALTER TABLE public.addresses ADD COLUMN notes text;