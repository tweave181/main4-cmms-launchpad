-- Remove legacy columns from company_details and use addresses relationship
BEGIN;

-- 1) Ensure FK column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='company_details' AND column_name='company_address_id'
  ) THEN
    ALTER TABLE public.company_details
      ADD COLUMN company_address_id uuid NULL
      REFERENCES public.addresses(id) ON DELETE SET NULL;
  END IF;
END$$;

-- 1a) OPTIONAL backfill: try to link existing free-text addresses
-- This assumes we can match some existing address text to addresses table
WITH src AS (
  SELECT id as company_id, TRIM(address) as addr_text
  FROM public.company_details
  WHERE address IS NOT NULL AND address <> '' AND address <> 'EMPTY'
),
match AS (
  SELECT s.company_id, a.id as addr_id
  FROM src s
  JOIN public.addresses a ON TRIM(a.address_line_1) = s.addr_text
)
UPDATE public.company_details c
SET company_address_id = m.addr_id
FROM match m
WHERE c.id = m.company_id
  AND c.company_address_id IS NULL;

-- 2) Drop legacy columns
ALTER TABLE public.company_details
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS type;

COMMIT;