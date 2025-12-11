-- Update initialize_tenant_defaults to populate organization_name and system_contact_email
CREATE OR REPLACE FUNCTION public.initialize_tenant_defaults(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Get tenant name
  SELECT name INTO v_tenant_name FROM tenants WHERE id = p_tenant_id;
  
  -- Get first admin user's email for this tenant
  SELECT email INTO v_user_email FROM users WHERE tenant_id = p_tenant_id AND role = 'admin' LIMIT 1;

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

  -- 5. Insert default program settings WITH organization_name and system_contact_email
  IF NOT EXISTS (SELECT 1 FROM program_settings WHERE tenant_id = p_tenant_id LIMIT 1) THEN
    INSERT INTO program_settings (
      tenant_id, 
      organization_name,
      system_contact_email,
      country, 
      currency, 
      language, 
      date_format, 
      timezone
    ) VALUES (
      p_tenant_id, 
      v_tenant_name,
      v_user_email,
      'United Kingdom', 
      'GBP', 
      'en', 
      'DD/MM/YYYY', 
      'Europe/London'
    );
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