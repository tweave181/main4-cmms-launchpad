-- Fix the work_order_comments table to include comment_status_name
ALTER TABLE public.work_order_comments 
ADD COLUMN comment_status_name TEXT;

-- Add a default value for existing records
UPDATE public.work_order_comments 
SET comment_status_name = 'Open' 
WHERE comment_status_name IS NULL;

-- Add some additional default comment status options for tenants that don't have any
INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT u.tenant_id, 'Open', '#22c55e', 1
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.comment_status_options cso 
  WHERE cso.tenant_id = u.tenant_id AND cso.status_name = 'Open'
);

INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT u.tenant_id, 'In Progress', '#3b82f6', 2
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.comment_status_options cso 
  WHERE cso.tenant_id = u.tenant_id AND cso.status_name = 'In Progress'
);

INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT u.tenant_id, 'Closed', '#6b7280', 3
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.comment_status_options cso 
  WHERE cso.tenant_id = u.tenant_id AND cso.status_name = 'Closed'
);