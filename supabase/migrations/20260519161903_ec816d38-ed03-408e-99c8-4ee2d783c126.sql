
-- 1) Revoke password_hash on customers from client roles
REVOKE SELECT (password_hash), UPDATE (password_hash), INSERT (password_hash)
  ON public.customers FROM anon, authenticated;

-- 2) program_settings: drop broad tenant policies, add admin-only
DROP POLICY IF EXISTS "Tenant select program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Tenant insert program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Tenant update program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Tenant delete program_settings" ON public.program_settings;

DROP POLICY IF EXISTS "Admin select program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Admin insert program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Admin update program_settings" ON public.program_settings;
DROP POLICY IF EXISTS "Admin delete program_settings" ON public.program_settings;

CREATE POLICY "Admin select program_settings" ON public.program_settings
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admin insert program_settings" ON public.program_settings
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admin update program_settings" ON public.program_settings
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admin delete program_settings" ON public.program_settings
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

-- 3) user_invitations: drop broad tenant policies, admin-only
DROP POLICY IF EXISTS "Tenant select invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Tenant insert invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Tenant update invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Tenant delete invitations" ON public.user_invitations;

DROP POLICY IF EXISTS "Admins select user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins insert user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins update user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins delete user_invitations" ON public.user_invitations;

CREATE POLICY "Admins select user_invitations" ON public.user_invitations
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins insert user_invitations" ON public.user_invitations
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins update user_invitations" ON public.user_invitations
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins delete user_invitations" ON public.user_invitations
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());
