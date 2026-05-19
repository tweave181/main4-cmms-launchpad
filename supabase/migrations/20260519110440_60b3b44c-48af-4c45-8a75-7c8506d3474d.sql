ALTER TABLE public.program_settings
ADD COLUMN IF NOT EXISTS units_system text NOT NULL DEFAULT 'metric';