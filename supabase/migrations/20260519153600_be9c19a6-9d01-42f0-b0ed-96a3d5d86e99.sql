
-- 1. asset_tag_prefix_audit_log: remove open policies
DROP POLICY IF EXISTS "Tenant insert prefix_audit" ON public.asset_tag_prefix_audit_log;
DROP POLICY IF EXISTS "Tenant select prefix_audit" ON public.asset_tag_prefix_audit_log;

-- 2. audit_logs: tighten INSERT to require user_id = auth.uid()
DROP POLICY IF EXISTS "Users can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. contract_reminders: add UPDATE and DELETE policies scoped to tenant
CREATE POLICY "Tenant update contract_reminders"
ON public.contract_reminders
FOR UPDATE
TO authenticated
USING (contract_id IN (SELECT id FROM public.service_contracts WHERE tenant_id = get_current_user_tenant_id()))
WITH CHECK (contract_id IN (SELECT id FROM public.service_contracts WHERE tenant_id = get_current_user_tenant_id()));

CREATE POLICY "Tenant delete contract_reminders"
ON public.contract_reminders
FOR DELETE
TO authenticated
USING (contract_id IN (SELECT id FROM public.service_contracts WHERE tenant_id = get_current_user_tenant_id()));

-- 4. customers.password_hash: revoke column SELECT from client roles
REVOKE SELECT (password_hash) ON public.customers FROM authenticated, anon;

-- 5. program_settings: revoke sensitive column SELECT from non-admin client roles
REVOKE SELECT (
  smtp_host, smtp_port, smtp_username, smtp_secure,
  main_contact_first_name, main_contact_surname,
  main_contact_phone, main_contact_mobile, main_contact_email,
  system_contact_email
) ON public.program_settings FROM authenticated, anon;

-- 6 & 7. Storage: enforce tenant-prefixed paths for checklist-item-images
DROP POLICY IF EXISTS "Authenticated users can delete checklist images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload checklist images" ON storage.objects;

CREATE POLICY "Tenant can upload checklist images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'checklist-item-images'
  AND (storage.foldername(name))[1] = get_current_user_tenant_id()::text
);

CREATE POLICY "Tenant can delete checklist images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'checklist-item-images'
  AND (storage.foldername(name))[1] = get_current_user_tenant_id()::text
);

-- 8. asset_hierarchy view: enforce caller's RLS
ALTER VIEW public.asset_hierarchy SET (security_invoker = true);
