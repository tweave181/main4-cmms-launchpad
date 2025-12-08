-- Update log_department_changes to handle NULL user gracefully during tenant initialization
CREATE OR REPLACE FUNCTION public.log_department_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Gracefully skip audit logging during tenant initialization (when user doesn't exist yet)
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
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
$function$;

-- Update log_job_title_changes to handle NULL user gracefully during tenant initialization
CREATE OR REPLACE FUNCTION public.log_job_title_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Gracefully skip audit logging during tenant initialization (when user doesn't exist yet)
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
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
$function$;