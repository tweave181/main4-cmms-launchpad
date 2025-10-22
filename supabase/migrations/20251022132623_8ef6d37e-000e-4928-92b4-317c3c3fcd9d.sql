-- Create checklist item templates table
CREATE TABLE IF NOT EXISTS public.checklist_item_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('safety_note', 'checkbox', 'to_do', 'reading')),
  safety_critical BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pm_schedule_template_items junction table
CREATE TABLE IF NOT EXISTS public.pm_schedule_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES public.checklist_item_templates(id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pm_schedule_id, template_item_id)
);

-- Create storage bucket for checklist item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'checklist-item-images',
  'checklist-item-images',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for checklist_item_templates
ALTER TABLE public.checklist_item_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active templates in their tenant"
ON public.checklist_item_templates
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND is_active = true);

CREATE POLICY "Admins can view all templates in their tenant"
ON public.checklist_item_templates
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Users can create templates in their tenant"
ON public.checklist_item_templates
FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update templates in their tenant"
ON public.checklist_item_templates
FOR UPDATE
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete templates in their tenant"
ON public.checklist_item_templates
FOR DELETE
USING (tenant_id = get_current_user_tenant_id());

-- RLS Policies for pm_schedule_template_items
ALTER TABLE public.pm_schedule_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template items for their tenant PM schedules"
ON public.pm_schedule_template_items
FOR SELECT
USING (
  pm_schedule_id IN (
    SELECT id FROM public.preventive_maintenance_schedules
    WHERE tenant_id = get_current_user_tenant_id()
  )
);

CREATE POLICY "Users can create template items for their tenant PM schedules"
ON public.pm_schedule_template_items
FOR INSERT
WITH CHECK (
  pm_schedule_id IN (
    SELECT id FROM public.preventive_maintenance_schedules
    WHERE tenant_id = get_current_user_tenant_id()
  )
);

CREATE POLICY "Users can update template items for their tenant PM schedules"
ON public.pm_schedule_template_items
FOR UPDATE
USING (
  pm_schedule_id IN (
    SELECT id FROM public.preventive_maintenance_schedules
    WHERE tenant_id = get_current_user_tenant_id()
  )
);

CREATE POLICY "Users can delete template items for their tenant PM schedules"
ON public.pm_schedule_template_items
FOR DELETE
USING (
  pm_schedule_id IN (
    SELECT id FROM public.preventive_maintenance_schedules
    WHERE tenant_id = get_current_user_tenant_id()
  )
);

-- Storage policies for checklist-item-images bucket
CREATE POLICY "Users can view checklist item images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'checklist-item-images');

CREATE POLICY "Users can upload checklist item images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'checklist-item-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own checklist item images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'checklist-item-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own checklist item images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'checklist-item-images' AND
  auth.uid() IS NOT NULL
);

-- Trigger to prevent deletion of safety-critical templates that are in use
CREATE OR REPLACE FUNCTION public.prevent_safety_critical_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.safety_critical = true THEN
    IF EXISTS (
      SELECT 1 FROM public.pm_schedule_template_items
      WHERE template_item_id = OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot delete safety-critical checklist item that is in use by PM schedules';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_safety_critical_before_delete
BEFORE DELETE ON public.checklist_item_templates
FOR EACH ROW
EXECUTE FUNCTION public.prevent_safety_critical_deletion();

-- Trigger to prevent removal of safety-critical items from PM schedules
CREATE OR REPLACE FUNCTION public.prevent_safety_critical_removal()
RETURNS TRIGGER AS $$
DECLARE
  is_safety_critical BOOLEAN;
BEGIN
  SELECT safety_critical INTO is_safety_critical
  FROM public.checklist_item_templates
  WHERE id = OLD.template_item_id;
  
  IF is_safety_critical = true THEN
    RAISE EXCEPTION 'Cannot remove safety-critical checklist item from PM schedule';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_safety_critical_before_removal
BEFORE DELETE ON public.pm_schedule_template_items
FOR EACH ROW
EXECUTE FUNCTION public.prevent_safety_critical_removal();

-- Create index for better query performance
CREATE INDEX idx_checklist_templates_tenant ON public.checklist_item_templates(tenant_id);
CREATE INDEX idx_checklist_templates_type ON public.checklist_item_templates(item_type);
CREATE INDEX idx_pm_schedule_templates_schedule ON public.pm_schedule_template_items(pm_schedule_id);
CREATE INDEX idx_pm_schedule_templates_template ON public.pm_schedule_template_items(template_item_id);

-- Add updated_at trigger for checklist_item_templates
CREATE TRIGGER update_checklist_item_templates_updated_at
BEFORE UPDATE ON public.checklist_item_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();