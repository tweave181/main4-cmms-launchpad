
-- Add status column to users table to track active/inactive state
ALTER TABLE public.users ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Add last_login column to track user activity
ALTER TABLE public.users ADD COLUMN last_login timestamp with time zone;

-- Add contractor role to the existing user_role enum
ALTER TYPE user_role ADD VALUE 'contractor';

-- Create user_invitations table to track pending invites
CREATE TABLE public.user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  role user_role NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.users(id),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations (only admins can manage invites within their tenant)
CREATE POLICY "Admins can view invitations in their tenant" 
  ON public.user_invitations 
  FOR SELECT 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create invitations in their tenant" 
  ON public.user_invitations 
  FOR INSERT 
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update invitations in their tenant" 
  ON public.user_invitations 
  FOR UPDATE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on users table for proper role-based access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view users in their tenant" 
  ON public.users 
  FOR SELECT 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update users in their tenant" 
  ON public.users 
  FOR UPDATE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_in_tenant()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.user_invitations;
  new_user_id uuid;
BEGIN
  -- Find valid invitation
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE token = invitation_token
    AND expires_at > now()
    AND accepted_at IS NULL;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.user_invitations
  SET accepted_at = now(), updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN invitation_record.id;
END;
$$;

-- Add trigger to update updated_at on user_invitations
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
