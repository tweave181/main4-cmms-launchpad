-- Create comprehensive tenant initialization function
CREATE OR REPLACE FUNCTION public.initialize_tenant_defaults(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- 1. Insert default location levels (if not already exists)
  IF NOT EXISTS (SELECT 1 FROM location_levels WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO location_levels (tenant_id, name, code) VALUES
      (p_tenant_id, 'Building', 'BLD'),
      (p_tenant_id, 'Floor', 'FLR'),
      (p_tenant_id, 'Room', 'RM'),
      (p_tenant_id, 'Zone', 'ZN'),
      (p_tenant_id, 'Area', 'AR'),
      (p_tenant_id, 'Department', 'DEPT');
  END IF;

  -- 2. Insert default departments
  IF NOT EXISTS (SELECT 1 FROM departments WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO departments (tenant_id, name, description) VALUES
      (p_tenant_id, 'Maintenance', 'General maintenance department'),
      (p_tenant_id, 'Operations', 'Operations and production'),
      (p_tenant_id, 'Facilities', 'Facilities management'),
      (p_tenant_id, 'IT', 'Information technology'),
      (p_tenant_id, 'Administration', 'Administrative services');
  END IF;

  -- 3. Insert default job titles
  IF NOT EXISTS (SELECT 1 FROM job_titles WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO job_titles (tenant_id, title_name) VALUES
      (p_tenant_id, 'Manager'),
      (p_tenant_id, 'Supervisor'),
      (p_tenant_id, 'Technician'),
      (p_tenant_id, 'Engineer'),
      (p_tenant_id, 'Administrator'),
      (p_tenant_id, 'Contractor');
  END IF;

  -- 4. Insert default asset categories
  IF NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO categories (tenant_id, name, description) VALUES
      (p_tenant_id, 'HVAC', 'Heating, ventilation, and air conditioning equipment'),
      (p_tenant_id, 'Electrical', 'Electrical systems and equipment'),
      (p_tenant_id, 'Plumbing', 'Plumbing and water systems'),
      (p_tenant_id, 'Mechanical', 'Mechanical equipment and machinery'),
      (p_tenant_id, 'Building Systems', 'Building infrastructure and systems'),
      (p_tenant_id, 'IT Equipment', 'Information technology hardware');
  END IF;

  -- 5. Insert default program settings
  IF NOT EXISTS (SELECT 1 FROM program_settings WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO program_settings (tenant_id, country, currency, language, date_format, timezone) VALUES
      (p_tenant_id, 'United Kingdom', 'GBP', 'en', 'DD/MM/YYYY', 'Europe/London');
  END IF;

  -- 6. Insert default notification settings (tenant level)
  IF NOT EXISTS (SELECT 1 FROM notification_settings WHERE tenant_id = p_tenant_id AND setting_type = 'tenant' LIMIT 1) THEN
    INSERT INTO notification_settings (
      tenant_id, 
      setting_type,
      low_stock_alerts_enabled,
      contract_reminders_enabled,
      maintenance_notifications_enabled,
      system_notifications_enabled,
      toast_notifications_enabled,
      toast_position,
      toast_duration
    ) VALUES (
      p_tenant_id,
      'tenant',
      true,
      true,
      true,
      true,
      true,
      'bottom-right',
      5000
    );
  END IF;

  -- 7. Insert default comment status options
  IF NOT EXISTS (SELECT 1 FROM comment_status_options WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO comment_status_options (tenant_id, status_name, status_color, sort_order, is_active) VALUES
      (p_tenant_id, 'Open', '#3B82F6', 1, true),
      (p_tenant_id, 'In Progress', '#F59E0B', 2, true),
      (p_tenant_id, 'On Hold', '#8B5CF6', 3, true),
      (p_tenant_id, 'Resolved', '#10B981', 4, true),
      (p_tenant_id, 'Closed', '#6B7280', 5, true);
  END IF;

  -- 8. Insert default spare parts categories
  IF NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO spare_parts_categories (tenant_id, name, description, is_active) VALUES
      (p_tenant_id, 'Filters', 'Air, oil, and other filters', true),
      (p_tenant_id, 'Belts & Hoses', 'Drive belts and hoses', true),
      (p_tenant_id, 'Electrical Components', 'Fuses, switches, and electrical parts', true),
      (p_tenant_id, 'Bearings & Seals', 'Bearings, seals, and gaskets', true),
      (p_tenant_id, 'Lubricants', 'Oils, greases, and lubricants', true),
      (p_tenant_id, 'General Hardware', 'Nuts, bolts, fasteners', true);
  END IF;

  RAISE LOG 'Initialized default data for tenant: %', p_tenant_id;
END;
$$;

-- Update handle_new_user to call initialize_tenant_defaults for NEW tenants
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  user_role user_role;
  tenant_name_var TEXT;
  existing_tenant_id UUID;
  is_new_tenant BOOLEAN := false;
BEGIN
  -- Get values from user metadata
  tenant_name_var := NEW.raw_user_meta_data ->> 'tenant_name';
  existing_tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
  user_name := COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    'User'
  );
  user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'technician');
  
  -- Log the values for debugging
  RAISE LOG 'Processing new user: %, tenant_name: %, existing_tenant_id: %, user_name: %, role: %', 
    NEW.id, tenant_name_var, existing_tenant_id, user_name, user_role;
  
  -- Determine tenant_id: either create new tenant or use existing one
  IF tenant_name_var IS NOT NULL THEN
    -- Check if tenant with this name already exists
    SELECT id INTO existing_tenant_id FROM public.tenants WHERE name = tenant_name_var LIMIT 1;
    
    IF existing_tenant_id IS NOT NULL THEN
      -- Use existing tenant
      new_tenant_id := existing_tenant_id;
      RAISE LOG 'Using existing tenant: % for user: %', new_tenant_id, NEW.id;
    ELSE
      -- Create new tenant
      INSERT INTO public.tenants (name)
      VALUES (tenant_name_var)
      RETURNING id INTO new_tenant_id;
      is_new_tenant := true;
      RAISE LOG 'Created new tenant: % for user: %', new_tenant_id, NEW.id;
    END IF;
  ELSIF existing_tenant_id IS NOT NULL THEN
    -- Use existing tenant
    new_tenant_id := existing_tenant_id;
    RAISE LOG 'Using provided tenant_id: % for user: %', new_tenant_id, NEW.id;
  ELSE
    -- No tenant information provided, raise error
    RAISE EXCEPTION 'Either tenant_name or tenant_id must be provided in user metadata';
  END IF;
  
  -- Insert user profile with role and tenant
  INSERT INTO public.users (
    id, 
    tenant_id, 
    email, 
    name,
    role
  ) VALUES (
    NEW.id,
    new_tenant_id,
    NEW.email,
    TRIM(user_name),
    user_role
  );
  
  -- Update the user's raw_user_meta_data to include tenant_id for JWT claims
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('tenant_id', new_tenant_id::text)
  WHERE id = NEW.id;
  
  -- Initialize default data for NEW tenants only
  IF is_new_tenant THEN
    PERFORM public.initialize_tenant_defaults(new_tenant_id);
    RAISE LOG 'Initialized default data for new tenant: %', new_tenant_id;
  END IF;
  
  RAISE LOG 'Successfully created user profile for: % with tenant_id: %', NEW.id, new_tenant_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RAISE;
END;
$$;