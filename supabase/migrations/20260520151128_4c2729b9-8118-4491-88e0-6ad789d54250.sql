
-- Service contract documents table
CREATE TABLE public.service_contract_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('file','link')),
  title text NOT NULL,
  description text,
  file_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  external_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scd_contract ON public.service_contract_documents(contract_id);
CREATE INDEX idx_scd_tenant ON public.service_contract_documents(tenant_id);

ALTER TABLE public.service_contract_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select scd" ON public.service_contract_documents
  FOR SELECT TO authenticated USING (tenant_id = public.get_current_user_tenant_id());
CREATE POLICY "Tenant insert scd" ON public.service_contract_documents
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_current_user_tenant_id());
CREATE POLICY "Tenant update scd" ON public.service_contract_documents
  FOR UPDATE TO authenticated USING (tenant_id = public.get_current_user_tenant_id());
CREATE POLICY "Tenant delete scd" ON public.service_contract_documents
  FOR DELETE TO authenticated USING (tenant_id = public.get_current_user_tenant_id());

CREATE TRIGGER trg_scd_updated_at
  BEFORE UPDATE ON public.service_contract_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Private storage bucket for contract documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-documents', 'contract-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tenant select contract-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'contract-documents'
    AND (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
  );

CREATE POLICY "Tenant insert contract-documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'contract-documents'
    AND (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
  );

CREATE POLICY "Tenant delete contract-documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'contract-documents'
    AND (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
  );
