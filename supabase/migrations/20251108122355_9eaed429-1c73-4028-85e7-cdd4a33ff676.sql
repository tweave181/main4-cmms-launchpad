-- Create storage bucket for work order attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-attachments', 'work-order-attachments', false);

-- Create table to track work order attachments
CREATE TABLE public.work_order_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_order_attachments
ALTER TABLE public.work_order_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_order_attachments table
CREATE POLICY "Users can view attachments in their tenant"
ON public.work_order_attachments
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can upload attachments in their tenant"
ON public.work_order_attachments
FOR INSERT
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Users can delete their own attachments"
ON public.work_order_attachments
FOR DELETE
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  AND uploaded_by = auth.uid()
);

-- Storage policies for work-order-attachments bucket
CREATE POLICY "Users can view attachments in their tenant"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'work-order-attachments'
  AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Users can upload attachments in their tenant"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'work-order-attachments'
  AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'work-order-attachments'
  AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM public.users WHERE id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_work_order_attachments_updated_at
BEFORE UPDATE ON public.work_order_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_work_order_attachments_work_order_id ON public.work_order_attachments(work_order_id);
CREATE INDEX idx_work_order_attachments_tenant_id ON public.work_order_attachments(tenant_id);