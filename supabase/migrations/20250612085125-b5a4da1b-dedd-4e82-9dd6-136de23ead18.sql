
-- Create preventive_maintenance_schedules table
CREATE TABLE public.preventive_maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
  frequency_value INTEGER NOT NULL DEFAULT 1, -- For custom frequency (e.g., every 2 weeks)
  frequency_unit TEXT, -- For custom frequency ('days', 'weeks', 'months')
  next_due_date DATE NOT NULL,
  last_completed_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for PM schedules and assets (many-to-many relationship)
CREATE TABLE public.pm_schedule_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pm_schedule_id UUID NOT NULL REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pm_schedule_id, asset_id)
);

-- Add RLS policies for preventive_maintenance_schedules
ALTER TABLE public.preventive_maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Policy for viewing PM schedules (users can see PM schedules in their tenant)
CREATE POLICY "Users can view PM schedules in their tenant" 
  ON public.preventive_maintenance_schedules 
  FOR SELECT 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for creating PM schedules (users can create PM schedules in their tenant)
CREATE POLICY "Users can create PM schedules in their tenant" 
  ON public.preventive_maintenance_schedules 
  FOR INSERT 
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for updating PM schedules (users can update PM schedules in their tenant)
CREATE POLICY "Users can update PM schedules in their tenant" 
  ON public.preventive_maintenance_schedules 
  FOR UPDATE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for deleting PM schedules (only admins can delete PM schedules in their tenant)
CREATE POLICY "Admins can delete PM schedules in their tenant" 
  ON public.preventive_maintenance_schedules 
  FOR DELETE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for pm_schedule_assets
ALTER TABLE public.pm_schedule_assets ENABLE ROW LEVEL SECURITY;

-- Policy for viewing PM schedule assets (users can see assets linked to PM schedules in their tenant)
CREATE POLICY "Users can view PM schedule assets in their tenant" 
  ON public.pm_schedule_assets 
  FOR SELECT 
  USING (
    pm_schedule_id IN (
      SELECT id FROM public.preventive_maintenance_schedules 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Policy for creating PM schedule assets (users can link assets to PM schedules in their tenant)
CREATE POLICY "Users can create PM schedule assets in their tenant" 
  ON public.pm_schedule_assets 
  FOR INSERT 
  WITH CHECK (
    pm_schedule_id IN (
      SELECT id FROM public.preventive_maintenance_schedules 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Policy for deleting PM schedule assets (users can unlink assets from PM schedules in their tenant)
CREATE POLICY "Users can delete PM schedule assets in their tenant" 
  ON public.pm_schedule_assets 
  FOR DELETE 
  USING (
    pm_schedule_id IN (
      SELECT id FROM public.preventive_maintenance_schedules 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_pm_schedules_updated_at 
  BEFORE UPDATE ON public.preventive_maintenance_schedules
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add a work_type enum value for preventive maintenance if it doesn't exist
-- Note: This is handled differently since we need to check if the value exists
DO $$ 
BEGIN
  -- Check if we need to add the preventive work_type (it should already exist based on the migration)
  -- This is just a safety check
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%work_orders_work_type_check%' 
    AND check_clause LIKE '%preventive%'
  ) THEN
    -- The preventive type should already exist, but just in case
    RAISE NOTICE 'Preventive work type should already exist in work_orders table';
  END IF;
END $$;
