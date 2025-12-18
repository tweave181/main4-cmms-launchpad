-- Drop old constraint that only allows letters
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS location_code_format;

-- Add new constraint allowing numbers after the first letter
ALTER TABLE public.locations 
  ADD CONSTRAINT location_code_format 
  CHECK (location_code ~ '^[A-Z][A-Z0-9]*$');