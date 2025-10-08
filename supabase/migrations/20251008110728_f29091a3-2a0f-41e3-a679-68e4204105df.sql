-- Phase 1: Create Permission Matrix System

-- Create permissions table to define all available permissions
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL, -- create, read, update, delete, manage_all, export, approve
  resource text NOT NULL, -- assets, work_orders, users, contracts, etc.
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(action, resource)
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(role, permission_id)
);

-- Create user_permission_overrides for specific user exceptions
CREATE TABLE public.user_permission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true, -- true = grant, false = revoke
  tenant_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Anyone can view permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage permissions"
  ON public.permissions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'system_admin'))
  WITH CHECK (has_role(auth.uid(), 'system_admin'));

-- RLS Policies for role_permissions table
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'system_admin'))
  WITH CHECK (has_role(auth.uid(), 'system_admin'));

-- RLS Policies for user_permission_overrides
CREATE POLICY "Users can view their own overrides"
  ON public.user_permission_overrides FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'system_admin'));

CREATE POLICY "System admins can manage overrides"
  ON public.user_permission_overrides FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'system_admin'))
  WITH CHECK (has_role(auth.uid(), 'system_admin'));

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  _user_id uuid,
  _action text,
  _resource text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _permission_id uuid;
  _has_override boolean;
  _override_granted boolean;
BEGIN
  -- Get permission ID
  SELECT id INTO _permission_id
  FROM public.permissions
  WHERE action = _action AND resource = _resource;
  
  IF _permission_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for user-specific override first
  SELECT EXISTS(SELECT 1 FROM public.user_permission_overrides WHERE user_id = _user_id AND permission_id = _permission_id),
         COALESCE((SELECT granted FROM public.user_permission_overrides WHERE user_id = _user_id AND permission_id = _permission_id LIMIT 1), false)
  INTO _has_override, _override_granted;
  
  IF _has_override THEN
    RETURN _override_granted;
  END IF;
  
  -- Check role-based permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND rp.permission_id = _permission_id
  );
END;
$$;

-- Helper function to check if user has any of the specified permissions
CREATE OR REPLACE FUNCTION public.user_has_any_permission(
  _user_id uuid,
  _permissions jsonb -- array of {action, resource} objects
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _perm jsonb;
BEGIN
  FOR _perm IN SELECT * FROM jsonb_array_elements(_permissions)
  LOOP
    IF public.user_has_permission(_user_id, _perm->>'action', _perm->>'resource') THEN
      RETURN true;
    END IF;
  END LOOP;
  RETURN false;
END;
$$;

-- Seed default permissions
INSERT INTO public.permissions (action, resource, description) VALUES
  -- Assets
  ('create', 'assets', 'Create new assets'),
  ('read', 'assets', 'View assets'),
  ('update', 'assets', 'Edit assets'),
  ('delete', 'assets', 'Delete assets'),
  ('export', 'assets', 'Export asset data'),
  
  -- Work Orders
  ('create', 'work_orders', 'Create work orders'),
  ('read', 'work_orders', 'View work orders'),
  ('update', 'work_orders', 'Edit work orders'),
  ('delete', 'work_orders', 'Delete work orders'),
  ('approve', 'work_orders', 'Approve work orders'),
  ('export', 'work_orders', 'Export work order data'),
  
  -- Users
  ('create', 'users', 'Invite/create users'),
  ('read', 'users', 'View user list'),
  ('update', 'users', 'Edit user profiles'),
  ('delete', 'users', 'Deactivate users'),
  ('manage_roles', 'users', 'Assign roles to users'),
  
  -- Service Contracts
  ('create', 'contracts', 'Create service contracts'),
  ('read', 'contracts', 'View contracts'),
  ('update', 'contracts', 'Edit contracts'),
  ('delete', 'contracts', 'Delete contracts'),
  
  -- Inventory
  ('create', 'inventory', 'Add inventory parts'),
  ('read', 'inventory', 'View inventory'),
  ('update', 'inventory', 'Edit inventory'),
  ('delete', 'inventory', 'Delete inventory'),
  ('adjust_stock', 'inventory', 'Adjust stock levels'),
  
  -- Preventive Maintenance
  ('create', 'pm_schedules', 'Create PM schedules'),
  ('read', 'pm_schedules', 'View PM schedules'),
  ('update', 'pm_schedules', 'Edit PM schedules'),
  ('delete', 'pm_schedules', 'Delete PM schedules'),
  
  -- Maintenance Jobs
  ('create', 'maintenance_jobs', 'Create maintenance jobs'),
  ('read', 'maintenance_jobs', 'View maintenance jobs'),
  ('update', 'maintenance_jobs', 'Edit maintenance jobs'),
  ('delete', 'maintenance_jobs', 'Delete maintenance jobs'),
  
  -- Locations
  ('create', 'locations', 'Create locations'),
  ('read', 'locations', 'View locations'),
  ('update', 'locations', 'Edit locations'),
  ('delete', 'locations', 'Delete locations'),
  
  -- Departments
  ('create', 'departments', 'Create departments'),
  ('read', 'departments', 'View departments'),
  ('update', 'departments', 'Edit departments'),
  ('delete', 'departments', 'Delete departments'),
  
  -- Companies/Vendors
  ('create', 'companies', 'Create companies/vendors'),
  ('read', 'companies', 'View companies/vendors'),
  ('update', 'companies', 'Edit companies/vendors'),
  ('delete', 'companies', 'Delete companies/vendors'),
  
  -- Reports
  ('read', 'reports', 'View reports'),
  ('export', 'reports', 'Export reports'),
  
  -- Settings
  ('read', 'settings', 'View system settings'),
  ('update', 'settings', 'Edit system settings'),
  
  -- Audit Logs
  ('read', 'audit_logs', 'View audit logs');

-- Seed default role permissions based on the permission matrix
-- System Admin: Full access to everything
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'system_admin'::app_role, id FROM public.permissions;

-- Admin: Full access except system settings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions
WHERE NOT (resource = 'settings' AND action = 'update');

-- Manager: Most operations except deletions and user management
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE action IN ('create', 'read', 'update', 'export', 'approve', 'adjust_stock')
  AND resource NOT IN ('users', 'settings');

-- Technician: Read most, create/update work orders and maintenance jobs
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'technician'::app_role, id FROM public.permissions
WHERE (action = 'read' AND resource NOT IN ('users', 'settings', 'audit_logs'))
   OR (action IN ('create', 'update') AND resource IN ('work_orders', 'maintenance_jobs'))
   OR (resource = 'inventory' AND action = 'read');

-- Contractor: Limited to assigned work orders and maintenance jobs
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'contractor'::app_role, id FROM public.permissions
WHERE (action = 'read' AND resource IN ('work_orders', 'maintenance_jobs', 'assets'))
   OR (action = 'update' AND resource IN ('work_orders', 'maintenance_jobs'));

-- Add audit logging for permission changes
CREATE OR REPLACE FUNCTION public.log_permission_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  tenant_id_var uuid;
BEGIN
  SELECT id, tenant_id INTO current_user_id, tenant_id_var 
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, action, entity_type, entity_id, 
      changes, tenant_id
    ) VALUES (
      current_user_id, 'permission.grant', TG_TABLE_NAME, NEW.id,
      jsonb_build_object('granted', NEW), tenant_id_var
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, action, entity_type, entity_id,
      changes, tenant_id
    ) VALUES (
      current_user_id, 'permission.revoke', TG_TABLE_NAME, OLD.id,
      jsonb_build_object('revoked', OLD), tenant_id_var
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for audit logging
CREATE TRIGGER log_role_permission_changes
  AFTER INSERT OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_permission_changes();

CREATE TRIGGER log_user_permission_override_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_permission_overrides
  FOR EACH ROW EXECUTE FUNCTION public.log_permission_changes();