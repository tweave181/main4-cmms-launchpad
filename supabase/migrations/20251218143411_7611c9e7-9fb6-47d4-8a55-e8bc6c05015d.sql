-- Add department_id column to locations table
ALTER TABLE public.locations 
ADD COLUMN department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- Drop the parent_location_id column (removes hierarchy)
ALTER TABLE public.locations DROP COLUMN parent_location_id;