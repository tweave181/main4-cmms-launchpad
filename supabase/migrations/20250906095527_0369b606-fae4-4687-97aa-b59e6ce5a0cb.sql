-- Fix all remaining database functions to complete security fixes

-- Fix log_department_changes function
CREATE OR REPLACE FUNCTION public.log_department_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;

-- Fix log_job_title_changes function
CREATE OR REPLACE FUNCTION public.log_job_title_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;

-- Fix remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  invitation_record public.user_invitations;
  new_user_id uuid;
BEGIN
  -- Find valid invitation
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE token = invitation_token
    AND expires_at > now()
    AND accepted_at IS NULL;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.user_invitations
  SET accepted_at = now(), updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN invitation_record.id;
END;
$function$;

-- Fix check_contract_reminders function
CREATE OR REPLACE FUNCTION public.check_contract_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert reminders for contracts that need them
  INSERT INTO public.contract_reminders (contract_id, reminder_date)
  SELECT 
    sc.id,
    CURRENT_DATE
  FROM public.service_contracts sc
  WHERE sc.reminder_days_before IS NOT NULL
    AND sc.status = 'Active'
    AND CURRENT_DATE = (sc.end_date - INTERVAL '1 day' * sc.reminder_days_before)
    AND NOT EXISTS (
      SELECT 1 FROM public.contract_reminders cr 
      WHERE cr.contract_id = sc.id 
      AND cr.reminder_date = CURRENT_DATE
    );
END;
$function$;

-- Fix generate_maintenance_jobs_from_pm_schedules function
CREATE OR REPLACE FUNCTION public.generate_maintenance_jobs_from_pm_schedules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  pm_record RECORD;
  asset_record RECORD;
  job_due_date DATE;
BEGIN
  -- Find PM schedules that are due and don't have recent jobs created
  FOR pm_record IN
    SELECT pms.*, u.name as assigned_user_name
    FROM public.preventive_maintenance_schedules pms
    LEFT JOIN public.users u ON u.id = pms.assigned_to
    WHERE pms.is_active = true
    AND pms.next_due_date <= CURRENT_DATE + INTERVAL '7 days' -- Generate jobs for next 7 days
    AND NOT EXISTS (
      SELECT 1 FROM public.maintenance_jobs mj 
      WHERE mj.pm_schedule_id = pms.id 
      AND mj.due_date = pms.next_due_date
    )
  LOOP
    -- For each asset linked to this PM schedule
    FOR asset_record IN
      SELECT a.id, a.name 
      FROM public.assets a
      JOIN public.pm_schedule_assets psa ON psa.asset_id = a.id
      WHERE psa.pm_schedule_id = pm_record.id
    LOOP
      -- Create maintenance job
      INSERT INTO public.maintenance_jobs (
        tenant_id,
        pm_schedule_id,
        asset_id,
        assigned_to,
        name,
        description,
        instructions,
        due_date,
        created_by
      ) VALUES (
        pm_record.tenant_id,
        pm_record.id,
        asset_record.id,
        pm_record.assigned_to,
        pm_record.name || ' - ' || asset_record.name,
        pm_record.description,
        pm_record.instructions,
        pm_record.next_due_date,
        pm_record.created_by
      );
    END LOOP;
  END LOOP;
END;
$function$;