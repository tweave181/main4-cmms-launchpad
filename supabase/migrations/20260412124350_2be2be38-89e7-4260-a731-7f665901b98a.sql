CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tenant_name text;
  tenant_slug text;
  new_tenant_id uuid;
  user_role public.user_role;
  invitation_tenant_id uuid;
  invitation_role public.user_role;
  inv_code text;
BEGIN
  -- Check for invitation
  inv_code := NEW.raw_user_meta_data->>'invitation_code';
  
  IF inv_code IS NOT NULL THEN
    SELECT ui.tenant_id, ui.role INTO invitation_tenant_id, invitation_role
    FROM public.user_invitations ui
    WHERE ui.invitation_code = inv_code AND ui.status = 'pending';
    
    IF invitation_tenant_id IS NOT NULL THEN
      INSERT INTO public.users (id, tenant_id, email, name, role)
      VALUES (NEW.id, invitation_tenant_id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), invitation_role);
      
      UPDATE public.user_invitations SET status = 'accepted', accepted_at = now()
      WHERE user_invitations.invitation_code = inv_code;
      
      -- Add to user_roles
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, invitation_role::text::public.app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RETURN NEW;
    END IF;
  END IF;
  
  -- Create new tenant
  tenant_name := COALESCE(NEW.raw_user_meta_data->>'tenant_name', 'My Organization');
  tenant_slug := COALESCE(NEW.raw_user_meta_data->>'tenant_slug', 'org-' || substr(NEW.id::text, 1, 8));
  
  INSERT INTO public.tenants (name, slug)
  VALUES (tenant_name, tenant_slug)
  RETURNING id INTO new_tenant_id;
  
  -- Create user profile
  INSERT INTO public.users (id, tenant_id, email, name, role)
  VALUES (NEW.id, new_tenant_id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'admin');
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;