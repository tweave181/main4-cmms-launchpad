-- Create business_types lookup table
CREATE TABLE public.business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view active business types (needed for registration)
CREATE POLICY "Anyone can view active business types"
ON public.business_types FOR SELECT
USING (is_active = true);

-- Only system admins can manage business types
CREATE POLICY "System admins can manage business types"
ON public.business_types FOR ALL
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Seed default business types
INSERT INTO public.business_types (name, category, sort_order) VALUES
  ('Hospital', 'Healthcare', 1),
  ('Clinic', 'Healthcare', 2),
  ('Care Home', 'Healthcare', 3),
  ('Medical Centre', 'Healthcare', 4),
  ('Shopping Centre', 'Retail', 10),
  ('Retail Park', 'Retail', 11),
  ('Supermarket', 'Retail', 12),
  ('Office Block', 'Commercial', 20),
  ('Business Park', 'Commercial', 21),
  ('Co-working Space', 'Commercial', 22),
  ('School', 'Education', 30),
  ('University', 'Education', 31),
  ('College', 'Education', 32),
  ('Factory', 'Industrial', 40),
  ('Warehouse', 'Industrial', 41),
  ('Distribution Centre', 'Industrial', 42),
  ('Hotel', 'Hospitality', 50),
  ('Leisure Centre', 'Hospitality', 51),
  ('Sports Facility', 'Hospitality', 52),
  ('Apartment Complex', 'Residential', 60),
  ('Housing Estate', 'Residential', 61),
  ('Government Building', 'Public Sector', 70),
  ('Council Office', 'Public Sector', 71),
  ('Airport', 'Transport', 80),
  ('Train Station', 'Transport', 81),
  ('Bus Depot', 'Transport', 82),
  ('Mixed Use', 'Other', 90),
  ('Other', 'Other', 99);

-- Add business_type column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN business_type TEXT;

-- Create tenant_invitations table
CREATE TABLE public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID,
  tenant_id UUID REFERENCES public.tenants(id),
  notes TEXT,
  is_revoked BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- System admins can do everything with invitations
CREATE POLICY "System admins can manage invitations"
ON public.tenant_invitations FOR ALL
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Anonymous users can validate invitations (for registration)
CREATE POLICY "Anyone can validate invitations"
ON public.tenant_invitations FOR SELECT
USING (true);

-- Function to generate a secure invitation code
CREATE OR REPLACE FUNCTION public.generate_tenant_invitation(
  p_expires_in_days INTEGER DEFAULT 7,
  p_notes TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_user_id UUID;
BEGIN
  -- Check if user is system admin
  IF NOT public.is_system_admin() THEN
    RAISE EXCEPTION 'Only system administrators can generate invitations';
  END IF;
  
  v_user_id := auth.uid();
  
  -- Generate a unique code
  v_code := 'TENANT-' || 
            UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4)) || '-' ||
            UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.tenant_invitations WHERE code = v_code) LOOP
    v_code := 'TENANT-' || 
              UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4)) || '-' ||
              UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));
  END LOOP;
  
  -- Insert the invitation
  INSERT INTO public.tenant_invitations (code, created_by, expires_at, notes)
  VALUES (v_code, v_user_id, now() + (p_expires_in_days || ' days')::INTERVAL, p_notes);
  
  RETURN v_code;
END;
$$;

-- Function to validate an invitation code
CREATE OR REPLACE FUNCTION public.validate_tenant_invitation(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT * INTO v_invitation
  FROM public.tenant_invitations
  WHERE code = UPPER(TRIM(p_code));
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid invitation code');
  END IF;
  
  IF v_invitation.is_revoked THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has been revoked');
  END IF;
  
  IF v_invitation.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has already been used');
  END IF;
  
  IF v_invitation.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has expired');
  END IF;
  
  RETURN jsonb_build_object('valid', true, 'expires_at', v_invitation.expires_at);
END;
$$;

-- Function to consume an invitation after successful registration
CREATE OR REPLACE FUNCTION public.consume_tenant_invitation(
  p_code TEXT,
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tenant_invitations
  SET 
    used_at = now(),
    used_by = p_user_id,
    tenant_id = p_tenant_id
  WHERE code = UPPER(TRIM(p_code))
    AND used_at IS NULL
    AND is_revoked = false
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- Function to revoke an invitation
CREATE OR REPLACE FUNCTION public.revoke_tenant_invitation(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_system_admin() THEN
    RAISE EXCEPTION 'Only system administrators can revoke invitations';
  END IF;
  
  UPDATE public.tenant_invitations
  SET is_revoked = true
  WHERE code = UPPER(TRIM(p_code))
    AND used_at IS NULL;
  
  RETURN FOUND;
END;
$$;