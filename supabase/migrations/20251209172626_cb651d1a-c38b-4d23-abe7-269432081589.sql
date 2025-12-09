-- Add setup_wizard_dismissed column to program_settings
ALTER TABLE public.program_settings 
ADD COLUMN IF NOT EXISTS setup_wizard_dismissed BOOLEAN DEFAULT false;