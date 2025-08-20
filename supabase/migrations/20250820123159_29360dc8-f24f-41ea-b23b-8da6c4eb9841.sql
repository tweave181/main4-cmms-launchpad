-- Generate some sample maintenance jobs for testing
-- First, call the function to generate jobs from existing PM schedules
SELECT public.generate_maintenance_jobs_from_pm_schedules();

-- Insert some additional sample maintenance jobs for demonstration
INSERT INTO public.maintenance_jobs (
  tenant_id,
  asset_id,
  name,
  description,
  instructions,
  status,
  priority,
  due_date,
  created_by
)
SELECT 
  pms.tenant_id,
  psa.asset_id,
  'Manual Inspection - ' || a.name,
  'Perform visual inspection and basic maintenance checks',
  'Check all visible components, lubricate moving parts, and document any issues found.',
  'open',
  'medium',
  CURRENT_DATE + (FLOOR(RANDOM() * 30) + 1)::INTEGER, -- Random due date within next 30 days
  pms.created_by
FROM public.preventive_maintenance_schedules pms
JOIN public.pm_schedule_assets psa ON psa.pm_schedule_id = pms.id
JOIN public.assets a ON a.id = psa.asset_id
WHERE pms.is_active = true
LIMIT 5; -- Limit to 5 sample jobs