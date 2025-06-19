
-- Create Job Titles table
CREATE TABLE public.job_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_name TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add job_title_id field to Users table
ALTER TABLE public.users ADD COLUMN job_title_id UUID REFERENCES public.job_titles(id) ON DELETE SET NULL;

-- Enable RLS on job_titles table
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_titles table
CREATE POLICY "Users can view job titles in their tenant"
  ON public.job_titles
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Admins can insert job titles in their tenant"
  ON public.job_titles
  FOR INSERT
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can update job titles in their tenant"
  ON public.job_titles
  FOR UPDATE
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Admins can delete job titles in their tenant"
  ON public.job_titles
  FOR DELETE
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_job_titles_updated_at
  BEFORE UPDATE ON public.job_titles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default job titles for existing tenants
INSERT INTO public.job_titles (title_name, tenant_id)
SELECT 'Maintenance Technician', id FROM public.tenants
UNION ALL
SELECT 'Senior Technician', id FROM public.tenants
UNION ALL
SELECT 'Facilities Manager', id FROM public.tenants
UNION ALL
SELECT 'Operations Manager', id FROM public.tenants
UNION ALL
SELECT 'Contractor', id FROM public.tenants;
