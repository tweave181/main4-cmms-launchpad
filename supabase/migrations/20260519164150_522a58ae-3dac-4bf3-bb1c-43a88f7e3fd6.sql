
-- 1. Revoke direct SELECT/UPDATE/INSERT on customers.password_hash from client roles
REVOKE SELECT (password_hash), INSERT (password_hash), UPDATE (password_hash) ON public.customers FROM anon, authenticated;

-- 2. Add UPDATE policy on storage bucket checklist-item-images (tenant-scoped by folder name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Tenant update checklist-item-images'
  ) THEN
    CREATE POLICY "Tenant update checklist-item-images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'checklist-item-images'
      AND (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    )
    WITH CHECK (
      bucket_id = 'checklist-item-images'
      AND (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    );
  END IF;
END $$;

-- 3. Pin search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Revoke EXECUTE on sensitive SECURITY DEFINER functions from anon (keep authenticated where needed by RLS / app)
REVOKE EXECUTE ON FUNCTION public.assign_system_admin_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_system_admin_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.consume_tenant_invitation(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_current_user_tenant_id() FROM PUBLIC, anon;
-- validate_tenant_invitation remains callable by anon (used during signup)
