import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface UpcomingContractRenewal {
  id: string;
  contract_title: string;
  vendor_name: string;
  end_date: string;
  asset_count?: number;
}

export const useUpcomingContractRenewals = () => {
  const { userProfile } = useAuth();

  const { data: renewals = [], isLoading, error } = useQuery({
    queryKey: ['upcoming-contract-renewals'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Calculate date 30 days from now
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Query contracts expiring within 30 days
      const { data: contracts, error } = await supabase
        .from('service_contracts')
        .select(`
          id,
          contract_title,
          vendor_name,
          end_date
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('end_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching upcoming contract renewals:', error);
        throw error;
      }

      // Get asset counts for each contract
      const contractsWithAssetCounts = await Promise.all(
        (contracts || []).map(async (contract) => {
          const { count } = await supabase
            .from('contract_asset_associations')
            .select('*', { count: 'exact', head: true })
            .eq('contract_id', contract.id);

          return {
            ...contract,
            asset_count: count || 0,
          };
        })
      );

      return contractsWithAssetCounts;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return {
    renewals,
    isLoading,
    error,
  };
};