
-- Phase 1: Complete RLS Policy Cleanup (with CASCADE to handle dependencies)
-- Disable RLS temporarily to allow cleanup
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table (including the missed ones from the error)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles in their tenant" ON public.users;
DROP POLICY IF EXISTS "Allow tenant users to read user data" ON public.users;
DROP POLICY IF EXISTS "Allow tenant users to update user data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "user_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "user_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their tenant" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users in their tenant" ON public.users;

-- Drop ALL existing policies on assets table (including the missed ones from the error)
DROP POLICY IF EXISTS "Users can view assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can create assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can update assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can delete assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can view tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can create tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update tenant assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete tenant assets" ON public.assets;
DROP POLICY IF EXISTS "asset_view_tenant" ON public.assets;
DROP POLICY IF EXISTS "asset_create_tenant" ON public.assets;
DROP POLICY IF EXISTS "asset_update_tenant" ON public.assets;
DROP POLICY IF EXISTS "asset_delete_tenant" ON public.assets;
DROP POLICY IF EXISTS "Only admins can delete assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view assets from their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can insert assets to their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can update assets from their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can delete assets from their tenant" ON public.assets;

-- Drop ALL existing policies on tenants table (including the missed ones from the error)
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can view tenant data" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenant_view_own" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update their tenant" ON public.tenants;

-- Now drop the problematic recursive security definer functions with CASCADE
DROP FUNCTION IF EXISTS public.get_current_user_tenant_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;

-- Phase 2: Re-enable RLS and Create JWT-Based Policies
-- Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Users Table: Simple, non-recursive policies using only auth.uid()
CREATE POLICY "select_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Assets Table: JWT-based tenant isolation
CREATE POLICY "view_assets_by_tenant"
  ON public.assets
  FOR SELECT
  TO authenticated
  USING (tenant_id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid);

CREATE POLICY "create_assets_in_tenant"
  ON public.assets
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid);

CREATE POLICY "update_assets_in_tenant"
  ON public.assets
  FOR UPDATE
  TO authenticated
  USING (tenant_id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid);

CREATE POLICY "delete_assets_in_tenant"
  ON public.assets
  FOR DELETE
  TO authenticated
  USING (tenant_id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid);

-- Tenants Table: JWT-based access to own tenant
CREATE POLICY "view_own_tenant"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid);

-- Update the handle_new_user function to set JWT claims
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  user_role user_role;
  tenant_name_var TEXT;
  existing_tenant_id UUID;
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
  
  RAISE LOG 'Successfully created user profile for: % with tenant_id: %', NEW.id, new_tenant_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RAISE;
END;
$function$
