-- Add hierarchical location support
ALTER TABLE public.locations 
ADD COLUMN parent_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
ADD COLUMN location_level TEXT CHECK (location_level IN ('Building', 'Floor', 'Room', 'Zone', 'Area', 'Department'));

-- Add index for performance
CREATE INDEX idx_locations_parent_location_id ON public.locations(parent_location_id);
CREATE INDEX idx_locations_location_level ON public.locations(location_level);

-- Update existing locations to have a default level
UPDATE public.locations SET location_level = 'Building' WHERE location_level IS NULL;