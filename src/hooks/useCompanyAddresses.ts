import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Address } from '@/types/address';

export const useCompanyAddresses = (companyId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['company-addresses', companyId],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('company_id', companyId)
        .order('address_line_1');

      if (error) {
        console.error('Error fetching company addresses:', error);
        throw error;
      }

      return data as Address[];
    },
    enabled: !!userProfile?.tenant_id && !!companyId,
  });
};