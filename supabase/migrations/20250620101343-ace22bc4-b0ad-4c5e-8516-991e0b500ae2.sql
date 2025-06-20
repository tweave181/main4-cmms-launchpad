
-- Create department_audit_log table
CREATE TABLE public.department_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_by UUID NOT NULL REFERENCES public.users(id),
  change_summary TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id)
);

-- Create job_title_audit_log table
CREATE TABLE public.job_title_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.job_titles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_by UUID NOT NULL REFERENCES public.users(id),
  change_summary TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id)
);

-- Add triggers for updated_at on audit tables
CREATE TRIGGER update_department_audit_log_updated_at 
  BEFORE UPDATE ON public.department_audit_log 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_title_audit_log_updated_at 
  BEFORE UPDATE ON public.job_title_audit_log 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on audit tables
ALTER TABLE public.department_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_title_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for department_audit_log
CREATE POLICY "Admin users can view department audit logs in their tenant" 
  ON public.department_audit_log 
  FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert department audit logs in their tenant" 
  ON public.department_audit_log 
  FOR INSERT 
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Create RLS policies for job_title_audit_log
CREATE POLICY "Admin users can view job title audit logs in their tenant" 
  ON public.job_title_audit_log 
  FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert job title audit logs in their tenant" 
  ON public.job_title_audit_log 
  FOR INSERT 
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Create function to automatically log department changes
CREATE OR REPLACE FUNCTION public.log_department_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
BEGIN
  -- Get current user and tenant
  SELECT id, tenant_id INTO current_user_id, tenant_id_var 
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Handle different trigger operations
  IF TG_OP = 'INSERT' THEN
    change_summary_text := 'Created new department: ' || NEW.name;
    IF NEW.description IS NOT NULL THEN
      change_summary_text := change_summary_text || ' (' || NEW.description || ')';
    END IF;
    
    INSERT INTO public.department_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.name != NEW.name THEN
      change_summary_text := change_summary_text || 'Updated name from ''' || OLD.name || ''' to ''' || NEW.name || '''. ';
    END IF;
    
    IF COALESCE(OLD.description, '') != COALESCE(NEW.description, '') THEN
      change_summary_text := change_summary_text || 'Updated description from ''' || COALESCE(OLD.description, '') || ''' to ''' || COALESCE(NEW.description, '') || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.department_audit_log (
        record_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    change_summary_text := 'Deleted department: ' || OLD.name;
    IF OLD.description IS NOT NULL THEN
      change_summary_text := change_summary_text || ' (' || OLD.description || ')';
    END IF;
    
    INSERT INTO public.department_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically log job title changes
CREATE OR REPLACE FUNCTION public.log_job_title_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
BEGIN
  -- Get current user and tenant
  SELECT id, tenant_id INTO current_user_id, tenant_id_var 
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Handle different trigger operations
  IF TG_OP = 'INSERT' THEN
    change_summary_text := 'Created new job title: ' || NEW.title_name;
    
    INSERT INTO public.job_title_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.title_name != NEW.title_name THEN
      change_summary_text := change_summary_text || 'Updated title from ''' || OLD.title_name || ''' to ''' || NEW.title_name || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.job_title_audit_log (
        record_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    change_summary_text := 'Deleted job title: ' || OLD.title_name;
    
    INSERT INTO public.job_title_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically log changes
CREATE TRIGGER department_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.log_department_changes();

CREATE TRIGGER job_title_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_titles
  FOR EACH ROW EXECUTE FUNCTION public.log_job_title_changes();
