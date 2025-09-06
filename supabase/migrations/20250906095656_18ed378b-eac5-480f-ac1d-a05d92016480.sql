-- Fix all remaining database functions to complete security fixes

-- Fix generate_work_order_number function
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  next_number INTEGER;
  work_order_number TEXT;
  latest_work_order_number TEXT;
  tenant_id_for_context UUID;
BEGIN
  -- Get current user's tenant ID for context
  SELECT get_current_user_tenant_id() INTO tenant_id_for_context;
  
  -- Log tenant ID being used for the query
  RAISE LOG 'Generating work order number for tenant: %', tenant_id_for_context;
  
  -- Get the latest work order number from the table
  SELECT work_order_number INTO latest_work_order_number
  FROM public.work_orders 
  WHERE work_order_number ~ '^WO[0-9]+$'
  ORDER BY CAST(SUBSTRING(work_order_number FROM 3) AS INTEGER) DESC
  LIMIT 1;
  
  -- Log the latest work order number found
  RAISE LOG 'Latest work order number found: %', COALESCE(latest_work_order_number, 'NULL');
  
  -- Parse the numeric suffix from the latest work order number
  IF latest_work_order_number IS NOT NULL THEN
    BEGIN
      next_number := CAST(SUBSTRING(latest_work_order_number FROM 3) AS INTEGER) + 1;
      RAISE LOG 'Parsed suffix: %, Next number will be: %', 
        SUBSTRING(latest_work_order_number FROM 3), next_number;
    EXCEPTION
      WHEN OTHERS THEN
        -- Parsing failed, default to 1
        next_number := 1;
        RAISE LOG 'Failed to parse last suffix; defaulting to WO001. Error: %', SQLERRM;
    END;
  ELSE
    -- No work orders found, start with 1
    next_number := 1;
    RAISE LOG 'No work orders found, starting with WO001';
  END IF;
  
  -- Format with leading zeros (minimum 3 digits): WO001, WO002, etc.
  work_order_number := 'WO' || LPAD(next_number::TEXT, 3, '0');
  
  -- Log the generated work order number
  RAISE LOG 'Generated work order number: %', work_order_number;
  
  RETURN work_order_number;
END;
$function$;

-- Fix set_work_order_number function
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Only set if not already provided
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := public.generate_work_order_number();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix trigger_contract_reminder_emails function
CREATE OR REPLACE FUNCTION public.trigger_contract_reminder_emails()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  contracts_processed INTEGER := 0;
  contract_record RECORD;
  admin_record RECORD;
  days_until_expiry INTEGER;
  today_date DATE := CURRENT_DATE;
  reminder_date DATE;
BEGIN
  -- Find contracts that need reminders today
  FOR contract_record IN
    SELECT 
      sc.id,
      sc.contract_title,
      sc.vendor_name,
      sc.end_date,
      sc.reminder_days_before,
      sc.tenant_id,
      t.name as tenant_name
    FROM service_contracts sc
    JOIN tenants t ON t.id = sc.tenant_id
    WHERE sc.email_reminder_enabled = true
    AND sc.reminder_days_before IS NOT NULL
    AND sc.end_date >= today_date
  LOOP
    -- Calculate reminder date
    reminder_date := contract_record.end_date - INTERVAL '1 day' * contract_record.reminder_days_before;
    
    -- Check if today is the reminder date
    IF reminder_date = today_date THEN
      -- Calculate days until expiry
      days_until_expiry := contract_record.end_date - today_date;
      
      -- Get admin users for this tenant
      FOR admin_record IN
        SELECT id, email, name
        FROM users
        WHERE tenant_id = contract_record.tenant_id
        AND role = 'admin'
      LOOP
        -- Log the email reminder (in practice, you'd send the actual email here)
        INSERT INTO contract_reminders_log (
          contract_id,
          user_id,
          delivery_method,
          tenant_id
        ) VALUES (
          contract_record.id,
          admin_record.id,
          'email',
          contract_record.tenant_id
        );
        
        contracts_processed := contracts_processed + 1;
      END LOOP;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'contracts_processed', contracts_processed,
    'processed_date', today_date
  );
END;
$function$;

-- Fix create_tenant_and_admin function
CREATE OR REPLACE FUNCTION public.create_tenant_and_admin(tenant_name text, tenant_slug text, user_id uuid, user_email text, first_name text DEFAULT NULL::text, last_name text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
BEGIN
  -- Create tenant (ignore slug parameter)
  INSERT INTO public.tenants (name)
  VALUES (tenant_name)
  RETURNING id INTO new_tenant_id;
  
  -- Construct user name from first_name and last_name
  user_name := TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')));
  IF user_name = '' THEN
    user_name := 'Admin User';
  END IF;
  
  -- Create admin user with role
  INSERT INTO public.users (id, tenant_id, email, name, role)
  VALUES (user_id, new_tenant_id, user_email, user_name, 'admin');
  
  RETURN new_tenant_id;
END;
$function$;

-- Fix fix_missing_profiles function
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  auth_user RECORD;
  missing_count INTEGER := 0;
BEGIN
  -- Find auth.users that don't have corresponding public.users entries
  FOR auth_user IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users pu WHERE pu.id = au.id
    )
  LOOP
    -- Insert missing user profile using metadata
    INSERT INTO public.users (id, tenant_id, email, name, role)
    VALUES (
      auth_user.id,
      (auth_user.raw_user_meta_data->>'tenant_id')::uuid,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'name', 'User'),
      COALESCE((auth_user.raw_user_meta_data->>'role')::user_role, 'technician')
    );
    
    missing_count := missing_count + 1;
    RAISE LOG 'Inserted missing user profile for: %', auth_user.id;
  END LOOP;
  
  RAISE LOG 'Fixed % missing user profiles', missing_count;
END;
$function$;

-- Fix process_stock_transaction function
CREATE OR REPLACE FUNCTION public.process_stock_transaction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$BEGIN
    -- Update the part quantity
    UPDATE public.inventory_parts 
    SET quantity_in_stock = NEW.quantity_after,
        updated_at = now()
    WHERE id = NEW.part_id;
    
    RETURN NEW;
END;$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix insert_default_location_levels function
CREATE OR REPLACE FUNCTION public.insert_default_location_levels(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.location_levels (tenant_id, name, code) VALUES
    (p_tenant_id, 'Building', 'BLD'),
    (p_tenant_id, 'Floor', 'FLR'),
    (p_tenant_id, 'Room', 'RM'),
    (p_tenant_id, 'Zone', 'ZN'),
    (p_tenant_id, 'Area', 'AR'),
    (p_tenant_id, 'Department', 'DEPT');
END;
$function$;