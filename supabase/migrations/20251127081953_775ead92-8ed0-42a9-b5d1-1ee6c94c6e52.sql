-- Create checklist_records table (middle layer between PM schedules and checklist lines)
CREATE TABLE public.checklist_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT,
  frequency_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checklist_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view checklist records in their tenant"
  ON public.checklist_records
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create checklist records in their tenant"
  ON public.checklist_records
  FOR INSERT
  WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update checklist records in their tenant"
  ON public.checklist_records
  FOR UPDATE
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete checklist records in their tenant"
  ON public.checklist_records
  FOR DELETE
  USING (tenant_id = get_current_user_tenant_id());

-- Indexes for performance
CREATE INDEX idx_checklist_records_tenant_id ON public.checklist_records(tenant_id);
CREATE INDEX idx_checklist_records_asset_type ON public.checklist_records(asset_type);
CREATE INDEX idx_checklist_records_frequency_type ON public.checklist_records(frequency_type);
CREATE INDEX idx_checklist_records_is_active ON public.checklist_records(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_checklist_records_updated_at
  BEFORE UPDATE ON public.checklist_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();