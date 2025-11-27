-- Create checklist_record_lines relationship table
CREATE TABLE public.checklist_record_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_record_id UUID NOT NULL REFERENCES public.checklist_records(id) ON DELETE CASCADE,
  checklist_line_id UUID NOT NULL REFERENCES public.checklist_item_templates(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(checklist_record_id, checklist_line_id)
);

-- Enable RLS
ALTER TABLE public.checklist_record_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view checklist record lines in their tenant"
  ON public.checklist_record_lines
  FOR SELECT
  USING (
    checklist_record_id IN (
      SELECT id FROM public.checklist_records 
      WHERE tenant_id = get_current_user_tenant_id()
    )
  );

CREATE POLICY "Users can create checklist record lines in their tenant"
  ON public.checklist_record_lines
  FOR INSERT
  WITH CHECK (
    checklist_record_id IN (
      SELECT id FROM public.checklist_records 
      WHERE tenant_id = get_current_user_tenant_id()
    )
  );

CREATE POLICY "Users can update checklist record lines in their tenant"
  ON public.checklist_record_lines
  FOR UPDATE
  USING (
    checklist_record_id IN (
      SELECT id FROM public.checklist_records 
      WHERE tenant_id = get_current_user_tenant_id()
    )
  );

CREATE POLICY "Users can delete checklist record lines in their tenant"
  ON public.checklist_record_lines
  FOR DELETE
  USING (
    checklist_record_id IN (
      SELECT id FROM public.checklist_records 
      WHERE tenant_id = get_current_user_tenant_id()
    )
  );

-- Indexes for performance
CREATE INDEX idx_checklist_record_lines_record_id ON public.checklist_record_lines(checklist_record_id);
CREATE INDEX idx_checklist_record_lines_line_id ON public.checklist_record_lines(checklist_line_id);
CREATE INDEX idx_checklist_record_lines_sort_order ON public.checklist_record_lines(checklist_record_id, sort_order);