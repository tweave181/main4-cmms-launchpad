import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useManufacturerAddresses = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['manufacturer-addresses', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data, error } = await supabase
        .from('addresses')
        .select(`
          id,
          company_id,
          company_details!company_id (
            id,
            company_name
          )
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .eq('is_manufacturer', true)
        .not('company_id', 'is', null);

      if (error) {
        console.error('Error fetching manufacturer addresses:', error);
        toast.error('Failed to load manufacturers');
        throw error;
      }

      // Remove duplicates and flatten the data
      const uniqueCompanies = data
        ?.filter(item => item.company_details)
        .reduce((acc, item) => {
          const companyId = item.company_details!.id;
          if (!acc.find(company => company.id === companyId)) {
            acc.push({
              id: companyId,
              company_name: item.company_details!.company_name
            });
          }
          return acc;
        }, [] as Array<{ id: string; company_name: string }>)
        || [];

      return uniqueCompanies;
    },
    enabled: !!userProfile?.tenant_id,
  });
};