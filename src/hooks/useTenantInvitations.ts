import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantInvitation {
  id: string;
  code: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  tenant_id: string | null;
  notes: string | null;
  is_revoked: boolean;
}

export interface InvitationValidationResult {
  valid: boolean;
  error?: string;
  expires_at?: string;
}

export const useTenantInvitations = () => {
  return useQuery({
    queryKey: ['tenant-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TenantInvitation[];
    },
  });
};

export const useGenerateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expiresInDays, notes }: { expiresInDays: number; notes?: string }) => {
      const { data, error } = await supabase.rpc('generate_tenant_invitation', {
        p_expires_in_days: expiresInDays,
        p_notes: notes || null,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
    },
  });
};

export const useValidateInvitation = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc('validate_tenant_invitation', {
        p_code: code,
      });

      if (error) throw error;
      return data as unknown as InvitationValidationResult;
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc('revoke_tenant_invitation', {
        p_code: code,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
    },
  });
};
