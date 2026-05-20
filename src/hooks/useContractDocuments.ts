import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

export interface ContractDocument {
  id: string;
  tenant_id: string;
  contract_id: string;
  document_type: 'file' | 'link';
  title: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  external_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET = 'contract-documents';

export const useContractDocuments = (contractId?: string) => {
  return useQuery({
    queryKey: ['contract-documents', contractId],
    queryFn: async () => {
      if (!contractId) return [] as ContractDocument[];
      const { data, error } = await supabase
        .from('service_contract_documents')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ContractDocument[];
    },
    enabled: !!contractId,
  });
};

export const useUploadContractFile = (contractId: string) => {
  const qc = useQueryClient();
  const { userProfile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: { file: File; title: string; description?: string }) => {
      if (!userProfile?.tenant_id) throw new Error('Missing tenant');
      const safeName = input.file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${userProfile.tenant_id}/${contractId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, input.file, { contentType: input.file.type, upsert: false });
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase
        .from('service_contract_documents')
        .insert({
          tenant_id: userProfile.tenant_id,
          contract_id: contractId,
          document_type: 'file',
          title: input.title,
          description: input.description || null,
          file_path: path,
          file_name: input.file.name,
          file_size: input.file.size,
          mime_type: input.file.type || null,
          created_by: user?.id ?? null,
        });
      if (insertErr) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw insertErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-documents', contractId] });
      toast({ title: 'Document uploaded' });
    },
    onError: (e: any) =>
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' }),
  });
};

export const useAddContractLink = (contractId: string) => {
  const qc = useQueryClient();
  const { userProfile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; url: string; description?: string }) => {
      if (!userProfile?.tenant_id) throw new Error('Missing tenant');
      const { error } = await supabase.from('service_contract_documents').insert({
        tenant_id: userProfile.tenant_id,
        contract_id: contractId,
        document_type: 'link',
        title: input.title,
        description: input.description || null,
        external_url: input.url,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-documents', contractId] });
      toast({ title: 'Link added' });
    },
    onError: (e: any) =>
      toast({ title: 'Failed to add link', description: e.message, variant: 'destructive' }),
  });
};

export const useDeleteContractDocument = (contractId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: ContractDocument) => {
      if (doc.document_type === 'file' && doc.file_path) {
        await supabase.storage.from(BUCKET).remove([doc.file_path]);
      }
      const { error } = await supabase
        .from('service_contract_documents')
        .delete()
        .eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-documents', contractId] });
      toast({ title: 'Document removed' });
    },
    onError: (e: any) =>
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
  });
};

export const getContractFileSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
};
