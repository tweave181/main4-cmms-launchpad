-- Add category fields to addresses table
ALTER TABLE public.addresses 
ADD COLUMN is_contact boolean DEFAULT false,
ADD COLUMN is_supplier boolean DEFAULT false,
ADD COLUMN is_manufacturer boolean DEFAULT false,
ADD COLUMN is_contractor boolean DEFAULT false,
ADD COLUMN is_other boolean DEFAULT false;