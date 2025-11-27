-- Add checklist_record_id column to preventive_maintenance_schedules
ALTER TABLE public.preventive_maintenance_schedules 
ADD COLUMN checklist_record_id UUID REFERENCES public.checklist_records(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_pm_schedules_checklist_record_id 
ON public.preventive_maintenance_schedules(checklist_record_id);

-- Add comment explaining the new relationship
COMMENT ON COLUMN public.preventive_maintenance_schedules.checklist_record_id IS 
'References the checklist record that defines what work should be done for this maintenance schedule. Replaces the direct link to individual checklist lines via pm_schedule_template_items.';