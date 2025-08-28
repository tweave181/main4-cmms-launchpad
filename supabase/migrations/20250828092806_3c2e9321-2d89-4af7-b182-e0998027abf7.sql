-- Add unique index for location level codes (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS ux_location_levels_code_ci
  ON public.location_levels (tenant_id, lower(code));

-- Add foreign key constraint if it doesn't exist
-- First check if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_locations_location_level_id'
        AND table_name = 'locations'
    ) THEN
        ALTER TABLE public.locations 
        ADD CONSTRAINT fk_locations_location_level_id 
        FOREIGN KEY (location_level_id) REFERENCES public.location_levels(id);
    END IF;
END
$$;