-- Update handle_new_user function to store business_type and consume invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  user_role user_role;
  tenant_name_var TEXT;
  existing_tenant_id UUID;
  is_new_tenant BOOLEAN := false;
  business_type_var TEXT;
  invitation_code_var TEXT;
BEGIN
  -- Get values from user metadata
  tenant_name_var := NEW.raw_user_meta_data ->> 'tenant_name';
  existing_tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
  user_name := COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    'User'
  );
  user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'technician');
  business_type_var := NEW.raw_user_meta_data ->> 'business_type';
  invitation_code_var := NEW.raw_user_meta_data ->> 'invitation_code';
  
  -- Log the values for debugging
  RAISE LOG 'Processing new user: %, tenant_name: %, existing_tenant_id: %, user_name: %, role: %, business_type: %', 
    NEW.id, tenant_name_var, existing_tenant_id, user_name, user_role, business_type_var;
  
  -- Determine tenant_id: either create new tenant or use existing one
  IF tenant_name_var IS NOT NULL THEN
    -- Check if tenant with this name already exists
    SELECT id INTO existing_tenant_id FROM public.tenants WHERE name = tenant_name_var LIMIT 1;
    
    IF existing_tenant_id IS NOT NULL THEN
      -- Use existing tenant
      new_tenant_id := existing_tenant_id;
      RAISE LOG 'Using existing tenant: % for user: %', new_tenant_id, NEW.id;
    ELSE
      -- Create new tenant with business_type
      INSERT INTO public.tenants (name, business_type)
      VALUES (tenant_name_var, business_type_var)
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
  
  -- Consume invitation code if provided
  IF invitation_code_var IS NOT NULL AND is_new_tenant THEN
    PERFORM public.consume_tenant_invitation(invitation_code_var, NEW.id, new_tenant_id);
    RAISE LOG 'Consumed invitation code: % for tenant: %', invitation_code_var, new_tenant_id;
  END IF;
  
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
$function$;