-- Update the audit log function to handle migration scenarios
CREATE OR REPLACE FUNCTION public.log_asset_prefix_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
BEGIN
  -- Get current user and tenant, handle case where no user is authenticated (during migrations)
  SELECT id, tenant_id INTO current_user_id, tenant_id_var 
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  -- If no user found (e.g., during migration), skip logging
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Handle different trigger operations
  IF TG_OP = 'INSERT' THEN
    change_summary_text := 'Created new prefix: ' || NEW.prefix_letter || NEW.number_code || ' (' || NEW.description || ')';
    
    INSERT INTO public.asset_tag_prefix_audit_log (
      prefix_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.prefix_letter != NEW.prefix_letter THEN
      change_summary_text := change_summary_text || 'Updated prefix letter from ''' || OLD.prefix_letter || ''' to ''' || NEW.prefix_letter || '''. ';
    END IF;
    
    IF OLD.number_code != NEW.number_code THEN
      change_summary_text := change_summary_text || 'Updated number code from ''' || OLD.number_code || ''' to ''' || NEW.number_code || '''. ';
    END IF;
    
    IF OLD.description != NEW.description THEN
      change_summary_text := change_summary_text || 'Updated description from ''' || OLD.description || ''' to ''' || NEW.description || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.asset_tag_prefix_audit_log (
        prefix_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    change_summary_text := 'Deleted prefix: ' || OLD.prefix_letter || OLD.number_code || ' (' || OLD.description || ')';
    
    INSERT INTO public.asset_tag_prefix_audit_log (
      prefix_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Now perform the category linking
UPDATE public.asset_tag_prefixes 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE c.name = asset_tag_prefixes.description
  AND c.tenant_id = asset_tag_prefixes.tenant_id
  LIMIT 1
)
WHERE category_id IS NULL 
AND EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.name = asset_tag_prefixes.description
  AND c.tenant_id = asset_tag_prefixes.tenant_id
);