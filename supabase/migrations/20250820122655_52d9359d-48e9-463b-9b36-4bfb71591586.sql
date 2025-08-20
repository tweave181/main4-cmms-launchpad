-- Create maintenance_jobs table to track individual maintenance job instances
CREATE TABLE public.maintenance_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  pm_schedule_id UUID REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'overdue', 'completed', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_maintenance_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.maintenance_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view maintenance jobs in their tenant" 
ON public.maintenance_jobs 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create maintenance jobs in their tenant" 
ON public.maintenance_jobs 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update maintenance jobs in their tenant" 
ON public.maintenance_jobs 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete maintenance jobs in their tenant" 
ON public.maintenance_jobs 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id());

-- Create indexes for performance
CREATE INDEX idx_maintenance_jobs_tenant_id ON public.maintenance_jobs(tenant_id);
CREATE INDEX idx_maintenance_jobs_asset_id ON public.maintenance_jobs(asset_id);
CREATE INDEX idx_maintenance_jobs_due_date ON public.maintenance_jobs(due_date);
CREATE INDEX idx_maintenance_jobs_status ON public.maintenance_jobs(status);

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_jobs_updated_at
  BEFORE UPDATE ON public.maintenance_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate maintenance jobs from PM schedules
CREATE OR REPLACE FUNCTION public.generate_maintenance_jobs_from_pm_schedules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pm_record RECORD;
  asset_record RECORD;
  job_due_date DATE;
BEGIN
  -- Find PM schedules that are due and don't have recent jobs created
  FOR pm_record IN
    SELECT pms.*, u.name as assigned_user_name
    FROM public.preventive_maintenance_schedules pms
    LEFT JOIN public.users u ON u.id = pms.assigned_to
    WHERE pms.is_active = true
    AND pms.next_due_date <= CURRENT_DATE + INTERVAL '7 days' -- Generate jobs for next 7 days
    AND NOT EXISTS (
      SELECT 1 FROM public.maintenance_jobs mj 
      WHERE mj.pm_schedule_id = pms.id 
      AND mj.due_date = pms.next_due_date
    )
  LOOP
    -- For each asset linked to this PM schedule
    FOR asset_record IN
      SELECT a.id, a.name 
      FROM public.assets a
      JOIN public.pm_schedule_assets psa ON psa.asset_id = a.id
      WHERE psa.pm_schedule_id = pm_record.id
    LOOP
      -- Create maintenance job
      INSERT INTO public.maintenance_jobs (
        tenant_id,
        pm_schedule_id,
        asset_id,
        assigned_to,
        name,
        description,
        instructions,
        due_date,
        created_by
      ) VALUES (
        pm_record.tenant_id,
        pm_record.id,
        asset_record.id,
        pm_record.assigned_to,
        pm_record.name || ' - ' || asset_record.name,
        pm_record.description,
        pm_record.instructions,
        pm_record.next_due_date,
        pm_record.created_by
      );
    END LOOP;
  END LOOP;
END;
$$;