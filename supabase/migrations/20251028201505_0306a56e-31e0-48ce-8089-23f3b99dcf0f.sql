-- Create time_records table
CREATE TABLE public.time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Parent entity references (at least one must be provided)
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  pm_schedule_id UUID REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE,
  maintenance_job_id UUID REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
  
  -- Optional asset reference for reporting
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  
  -- User who performed the work
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Time tracking fields
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked NUMERIC(5, 2) NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
  start_time TIME,
  end_time TIME,
  
  -- Work details
  description TEXT NOT NULL,
  work_type TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT time_records_parent_check CHECK (
    work_order_id IS NOT NULL OR 
    pm_schedule_id IS NOT NULL OR 
    maintenance_job_id IS NOT NULL
  ),
  CONSTRAINT time_records_time_range_check CHECK (
    start_time IS NULL OR end_time IS NULL OR start_time < end_time
  )
);

-- Enable RLS
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_time_records_work_order ON public.time_records(work_order_id) WHERE work_order_id IS NOT NULL;
CREATE INDEX idx_time_records_pm_schedule ON public.time_records(pm_schedule_id) WHERE pm_schedule_id IS NOT NULL;
CREATE INDEX idx_time_records_maintenance_job ON public.time_records(maintenance_job_id) WHERE maintenance_job_id IS NOT NULL;
CREATE INDEX idx_time_records_user_date ON public.time_records(user_id, work_date);
CREATE INDEX idx_time_records_tenant ON public.time_records(tenant_id);
CREATE INDEX idx_time_records_asset ON public.time_records(asset_id) WHERE asset_id IS NOT NULL;

-- Add comment
COMMENT ON TABLE public.time_records IS 'Time tracking records for work orders, PM schedules, and maintenance jobs';

-- RLS Policies

-- Users can view time records in their tenant
CREATE POLICY "Users can view time records in their tenant"
  ON public.time_records
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- Users can create time records in their tenant
CREATE POLICY "Users can create time records in their tenant"
  ON public.time_records
  FOR INSERT
  WITH CHECK (
    tenant_id = get_current_user_tenant_id() AND
    user_id = auth.uid()
  );

-- Users can update their own time records within 7 days
CREATE POLICY "Users can update their own recent time records"
  ON public.time_records
  FOR UPDATE
  USING (
    tenant_id = get_current_user_tenant_id() AND
    user_id = auth.uid() AND
    work_date >= CURRENT_DATE - INTERVAL '7 days'
  );

-- Admins can update any time records in their tenant
CREATE POLICY "Admins can update any time records in their tenant"
  ON public.time_records
  FOR UPDATE
  USING (
    tenant_id = get_current_user_tenant_id() AND
    is_current_user_admin()
  );

-- Admins can delete time records in their tenant
CREATE POLICY "Admins can delete time records in their tenant"
  ON public.time_records
  FOR DELETE
  USING (
    tenant_id = get_current_user_tenant_id() AND
    is_current_user_admin()
  );

-- Function to update work_orders.actual_hours based on time_records
CREATE OR REPLACE FUNCTION public.update_work_order_actual_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_work_order_id UUID;
  total_hours NUMERIC;
BEGIN
  -- Determine which work order to update
  IF TG_OP = 'DELETE' THEN
    target_work_order_id := OLD.work_order_id;
  ELSE
    target_work_order_id := NEW.work_order_id;
  END IF;
  
  -- Only proceed if there's a work order
  IF target_work_order_id IS NOT NULL THEN
    -- Calculate total hours from all time records
    SELECT COALESCE(SUM(hours_worked), 0)
    INTO total_hours
    FROM public.time_records
    WHERE work_order_id = target_work_order_id;
    
    -- Update work order
    UPDATE public.work_orders
    SET 
      actual_hours = total_hours,
      updated_at = now()
    WHERE id = target_work_order_id;
    
    RAISE LOG 'Updated work order % actual_hours to %', target_work_order_id, total_hours;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on time_records
CREATE TRIGGER trigger_update_work_order_actual_hours
  AFTER INSERT OR UPDATE OR DELETE ON public.time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_work_order_actual_hours();

COMMENT ON FUNCTION public.update_work_order_actual_hours() IS 
  'Automatically updates work_orders.actual_hours when time records change';

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_time_records_updated_at
  BEFORE UPDATE ON public.time_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();