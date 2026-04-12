
-- 1. Remove the overly permissive anon SELECT policy on user_invitations
DROP POLICY IF EXISTS "Anyone can view pending invitations" ON public.user_invitations;

-- 2. Remove the dangerous anon INSERT policy on customers
DROP POLICY IF EXISTS "Allow anonymous customer signup" ON public.customers;

-- 3. Fix asset_tag_prefix_audit_log RLS - replace always-true policies with tenant-scoped ones
DROP POLICY IF EXISTS "Users can view audit logs" ON public.asset_tag_prefix_audit_log;
DROP POLICY IF EXISTS "Users can create audit logs" ON public.asset_tag_prefix_audit_log;

-- Add tenant_id column to asset_tag_prefix_audit_log if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'asset_tag_prefix_audit_log' 
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.asset_tag_prefix_audit_log ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;

-- Create tenant-scoped policies for asset_tag_prefix_audit_log
CREATE POLICY "Users can view own tenant audit logs"
ON public.asset_tag_prefix_audit_log FOR SELECT TO authenticated
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Users can create own tenant audit logs"
ON public.asset_tag_prefix_audit_log FOR INSERT TO authenticated
WITH CHECK (tenant_id = public.get_current_user_tenant_id());
