-- Add service contract ID field to assets table
ALTER TABLE public.assets 
ADD COLUMN id_service_contracts uuid;