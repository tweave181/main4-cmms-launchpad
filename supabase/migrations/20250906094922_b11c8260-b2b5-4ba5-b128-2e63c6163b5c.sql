-- Fix database functions to have proper search_path for security
-- This addresses the 26 security warnings found by the linter

-- Fix get_current_user_tenant_id function
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$function$;

-- Fix is_admin_in_tenant function
CREATE OR REPLACE FUNCTION public.is_admin_in_tenant()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role = 'admin' FROM public.users WHERE id = auth.uid();
$function$;

-- Fix is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid() LIMIT 1), false);
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix is_system_admin function
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT public.has_role(auth.uid(), 'system_admin')
$function$;

-- Fix generate_location_code function
CREATE OR REPLACE FUNCTION public.generate_location_code(location_name text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  code TEXT;
  clean_name TEXT;
BEGIN
  -- Remove non-alphabetic characters and convert to uppercase
  clean_name := UPPER(REGEXP_REPLACE(location_name, '[^A-Za-z]', '', 'g'));
  
  -- Take first 3 characters, or less if name is shorter
  code := LEFT(clean_name, 3);
  
  -- Ensure minimum 2 characters
  IF LENGTH(code) < 2 THEN
    -- If name is too short, pad with 'X'
    code := RPAD(code, 2, 'X');
  END IF;
  
  RETURN code;
END;
$function$;

-- Fix ensure_unique_location_code function
CREATE OR REPLACE FUNCTION public.ensure_unique_location_code(p_tenant_id uuid, p_name text, p_existing_code text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from name
  base_code := public.generate_location_code(p_name);
  final_code := base_code;
  
  -- If an existing code is provided, use it
  IF p_existing_code IS NOT NULL AND LENGTH(p_existing_code) >= 2 AND p_existing_code ~ '^[A-Z]+$' THEN
    final_code := p_existing_code;
  END IF;
  
  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (
    SELECT 1 FROM public.locations 
    WHERE tenant_id = p_tenant_id AND location_code = final_code
  ) LOOP
    final_code := base_code || counter::TEXT;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 999 THEN
      RAISE EXCEPTION 'Unable to generate unique location code for name: %', p_name;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$function$;