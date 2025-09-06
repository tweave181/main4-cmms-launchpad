-- Temporarily disable the address audit log trigger for data migration
DROP TRIGGER IF EXISTS address_changes_trigger ON public.addresses;

-- Backfill company_id in addresses table by matching company names
UPDATE addresses 
SET company_id = cd.id
FROM company_details cd
WHERE addresses.company_id IS NULL
  AND addresses.company_name IS NOT NULL
  AND lower(trim(addresses.company_name)) = lower(trim(cd.company_name));

-- Also try to match by website domain if company names don't match exactly
UPDATE addresses 
SET company_id = cd.id
FROM company_details cd
WHERE addresses.company_id IS NULL
  AND addresses.website IS NOT NULL
  AND cd.company_website IS NOT NULL
  AND lower(trim(addresses.website)) = lower(trim(cd.company_website));

-- Match by email domain as a last resort
UPDATE addresses 
SET company_id = cd.id
FROM company_details cd
WHERE addresses.company_id IS NULL
  AND addresses.email IS NOT NULL
  AND cd.email IS NOT NULL
  AND lower(trim(addresses.email)) = lower(trim(cd.email));

-- Re-enable the address audit log trigger
CREATE TRIGGER address_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.log_address_changes();