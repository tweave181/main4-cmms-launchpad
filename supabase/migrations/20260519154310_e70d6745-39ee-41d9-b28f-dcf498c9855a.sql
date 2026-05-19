
-- =========================================
-- 1. AUDIT LOG SPOOFING: enforce changed_by/performed_by = auth.uid()
-- =========================================
DROP POLICY IF EXISTS "Tenant insert dept_audit" ON public.department_audit_log;
CREATE POLICY "Tenant insert dept_audit" ON public.department_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND changed_by = auth.uid());

DROP POLICY IF EXISTS "Tenant insert jt_audit" ON public.job_title_audit_log;
CREATE POLICY "Tenant insert jt_audit" ON public.job_title_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND changed_by = auth.uid());

DROP POLICY IF EXISTS "Tenant insert addr_audit" ON public.address_audit_log;
CREATE POLICY "Tenant insert addr_audit" ON public.address_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND changed_by = auth.uid());

DROP POLICY IF EXISTS "Users can create own tenant audit logs" ON public.asset_tag_prefix_audit_log;
CREATE POLICY "Users can create own tenant audit logs" ON public.asset_tag_prefix_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND performed_by = auth.uid());

-- =========================================
-- 2. PRIVILEGE ESCALATION: prevent users from changing their own role/tenant_id
-- Use a BEFORE UPDATE trigger so non-admins cannot modify sensitive columns.
-- =========================================
CREATE OR REPLACE FUNCTION public.prevent_user_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if the caller is an admin (admins can change roles/tenants)
  IF public.is_current_user_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-admin: forbid changing role or tenant_id
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Not authorized to change role';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'Not authorized to change tenant';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_self_escalation ON public.users;
CREATE TRIGGER trg_prevent_user_self_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_self_escalation();

-- =========================================
-- 3. CUSTOMER PORTAL: server-side session validation
-- =========================================
CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON public.customer_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON public.customer_sessions(customer_id);

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- No client access; only service role (edge functions) reads/writes
REVOKE ALL ON public.customer_sessions FROM anon, authenticated;

-- =========================================
-- 4. MISSING UPDATE/DELETE POLICIES
-- =========================================

-- user_invitations: admins only can update (e.g., status transitions)
DROP POLICY IF EXISTS "Admins update user_invitations" ON public.user_invitations;
CREATE POLICY "Admins update user_invitations" ON public.user_invitations
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- work_order_comments: owners can edit their own comments
DROP POLICY IF EXISTS "Users update own work_order_comments" ON public.work_order_comments;
CREATE POLICY "Users update own work_order_comments" ON public.work_order_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- stock_transactions: admins only can correct/delete erroneous records
DROP POLICY IF EXISTS "Admins update stock_transactions" ON public.stock_transactions;
CREATE POLICY "Admins update stock_transactions" ON public.stock_transactions
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "Admins delete stock_transactions" ON public.stock_transactions;
CREATE POLICY "Admins delete stock_transactions" ON public.stock_transactions
  FOR DELETE TO authenticated
  USING (is_current_user_admin());
