-- Create comment status options table for flexible status management
CREATE TABLE public.comment_status_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  status_name TEXT NOT NULL,
  status_color TEXT NOT NULL DEFAULT '#6b7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, status_name)
);

-- Enable RLS
ALTER TABLE public.comment_status_options ENABLE ROW LEVEL SECURITY;

-- Create policies for comment status options
CREATE POLICY "Users can view status options in their tenant" 
ON public.comment_status_options 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Admins can create status options in their tenant" 
ON public.comment_status_options 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can update status options in their tenant" 
ON public.comment_status_options 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can delete status options in their tenant" 
ON public.comment_status_options 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Insert default status options for existing tenants
INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT 
  u.tenant_id,
  'Open' as status_name,
  '#22c55e' as status_color,
  1 as sort_order
FROM public.users u
WHERE u.tenant_id IS NOT NULL;

INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT 
  u.tenant_id,
  'In Progress' as status_name,
  '#3b82f6' as status_color,
  2 as sort_order
FROM public.users u
WHERE u.tenant_id IS NOT NULL;

INSERT INTO public.comment_status_options (tenant_id, status_name, status_color, sort_order)
SELECT DISTINCT 
  u.tenant_id,
  'Closed' as status_name,
  '#6b7280' as status_color,
  3 as sort_order
FROM public.users u
WHERE u.tenant_id IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_comment_status_options_updated_at
BEFORE UPDATE ON public.comment_status_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();