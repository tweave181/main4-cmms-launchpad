
-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, tenant_id)
);

-- Add department_id column to assets table
ALTER TABLE public.assets 
ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Add trigger for updated_at on departments
CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON public.departments 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Users can view departments in their tenant" 
  ON public.departments 
  FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert departments in their tenant" 
  ON public.departments 
  FOR INSERT 
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update departments in their tenant" 
  ON public.departments 
  FOR UPDATE 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete departments in their tenant" 
  ON public.departments 
  FOR DELETE 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
