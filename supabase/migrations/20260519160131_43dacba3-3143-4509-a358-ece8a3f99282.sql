
DROP POLICY IF EXISTS "Admins select user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins insert user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins update user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins delete user_invitations" ON public.user_invitations;

CREATE POLICY "Admins select user_invitations"
ON public.user_invitations FOR SELECT TO authenticated
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins insert user_invitations"
ON public.user_invitations FOR INSERT TO authenticated
WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins update user_invitations"
ON public.user_invitations FOR UPDATE TO authenticated
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin())
WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins delete user_invitations"
ON public.user_invitations FOR DELETE TO authenticated
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

DROP POLICY IF EXISTS "Tenant insert contract_reminders_log" ON public.contract_reminders_log;
REVOKE ALL ON public.customer_sessions FROM anon, authenticated;
REVOKE SELECT (password_hash) ON public.customers FROM anon, authenticated;
