-- Create audit_logs table with tenant scoping and RLS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  ip inet,
  user_agent text,
  tenant_id uuid NOT NULL DEFAULT public.get_current_user_tenant_id()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: insert/select within tenant; no update/delete
CREATE POLICY "Users can insert audit logs in their tenant"
ON public.audit_logs
FOR INSERT
WITH CHECK (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Users can view audit logs in their tenant"
ON public.audit_logs
FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON public.audit_logs (user_id, created_at);
