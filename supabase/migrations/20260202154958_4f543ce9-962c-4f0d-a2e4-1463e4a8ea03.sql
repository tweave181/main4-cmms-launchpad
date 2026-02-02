-- Create a function to auto-confirm users created from invitations
CREATE OR REPLACE FUNCTION public.auto_confirm_invited_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user was created from an invitation (has invitation_token in metadata)
  IF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    -- Auto-confirm the user's email
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a trigger to run before insert on auth.users
-- Note: We cannot create triggers on auth.users directly, so we need an alternative approach
-- Instead, we'll create a function that can be called to confirm the user after signup

-- Create a function to confirm invited user email (to be called after signup)
CREATE OR REPLACE FUNCTION public.confirm_invited_user(p_user_id UUID, p_invitation_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_invitation_valid BOOLEAN;
BEGIN
  -- Verify the invitation token exists and is valid
  SELECT EXISTS(
    SELECT 1 FROM public.user_invitations
    WHERE token = p_invitation_token
    AND accepted_at IS NULL
    AND expires_at > NOW()
  ) INTO v_invitation_valid;

  IF v_invitation_valid THEN
    -- Update the invitation as accepted
    UPDATE public.user_invitations
    SET accepted_at = NOW()
    WHERE token = p_invitation_token;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;