-- Fix remaining database functions to complete security fixes
-- This addresses the remaining 18 security warnings

-- Fix log_address_changes function
CREATE OR REPLACE FUNCTION public.log_address_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
  address_preview TEXT;
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
    -- Format address preview
    address_preview := NEW.address_line_1;
    IF NEW.town_or_city IS NOT NULL THEN
      address_preview := address_preview || ', ' || NEW.town_or_city;
    END IF;
    IF NEW.postcode IS NOT NULL THEN
      address_preview := address_preview || ', ' || NEW.postcode;
    END IF;
    
    change_summary_text := 'Address Created: ' || address_preview;
    
    INSERT INTO public.address_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.address_line_1 != NEW.address_line_1 THEN
      change_summary_text := change_summary_text || 'Updated line 1 from ''' || OLD.address_line_1 || ''' to ''' || NEW.address_line_1 || '''. ';
    END IF;
    
    IF COALESCE(OLD.address_line_2, '') != COALESCE(NEW.address_line_2, '') THEN
      change_summary_text := change_summary_text || 'Updated line 2 from ''' || COALESCE(OLD.address_line_2, '') || ''' to ''' || COALESCE(NEW.address_line_2, '') || '''. ';
    END IF;
    
    IF COALESCE(OLD.town_or_city, '') != COALESCE(NEW.town_or_city, '') THEN
      change_summary_text := change_summary_text || 'Updated town/city from ''' || COALESCE(OLD.town_or_city, '') || ''' to ''' || COALESCE(NEW.town_or_city, '') || '''. ';
    END IF;
    
    IF COALESCE(OLD.postcode, '') != COALESCE(NEW.postcode, '') THEN
      change_summary_text := change_summary_text || 'Updated postcode from ''' || COALESCE(OLD.postcode, '') || ''' to ''' || COALESCE(NEW.postcode, '') || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.address_audit_log (
        record_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Format address preview for deletion
    address_preview := OLD.address_line_1;
    IF OLD.town_or_city IS NOT NULL THEN
      address_preview := address_preview || ', ' || OLD.town_or_city;
    END IF;
    IF OLD.postcode IS NOT NULL THEN
      address_preview := address_preview || ', ' || OLD.postcode;
    END IF;
    
    change_summary_text := 'Address Deleted: ' || address_preview;
    
    INSERT INTO public.address_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Fix other functions with search_path
CREATE OR REPLACE FUNCTION public.log_asset_prefix_changes()
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

-- Fix set_location_code function
CREATE OR REPLACE FUNCTION public.set_location_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Auto-generate code if not provided or empty
  IF NEW.location_code IS NULL OR TRIM(NEW.location_code) = '' THEN
    NEW.location_code := public.ensure_unique_location_code(NEW.tenant_id, NEW.name);
  ELSE
    -- Validate manually provided code
    IF LENGTH(NEW.location_code) < 2 OR LENGTH(NEW.location_code) > 5 THEN
      RAISE EXCEPTION 'Location code must be between 2 and 5 characters';
    END IF;
    
    IF NEW.location_code !~ '^[A-Z]+$' THEN
      RAISE EXCEPTION 'Location code must contain only uppercase letters';
    END IF;
    
    -- Ensure uniqueness for manually provided codes
    IF EXISTS (
      SELECT 1 FROM public.locations 
      WHERE tenant_id = NEW.tenant_id 
        AND location_code = NEW.location_code 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Location code % already exists in this tenant', NEW.location_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;