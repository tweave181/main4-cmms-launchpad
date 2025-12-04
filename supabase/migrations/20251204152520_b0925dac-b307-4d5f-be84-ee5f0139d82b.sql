-- Add scheduling columns to checklist_records
ALTER TABLE public.checklist_records
ADD COLUMN working_days jsonb DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb,
ADD COLUMN work_timing text DEFAULT 'in_hours';

-- Add check constraint for work_timing values
ALTER TABLE public.checklist_records
ADD CONSTRAINT checklist_records_work_timing_check 
CHECK (work_timing IN ('in_hours', 'out_of_hours', 'at_night', 'weekend'));