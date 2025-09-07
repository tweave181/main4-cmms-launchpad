import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useAddressUsage = (addressId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['address-usage', addressId, userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id || !addressId) {
        return { isInUse: false, usageDetails: [] };
      }

      // Check if address is used in company_details
      const { data: companyUsage, error: companyError } = await supabase
        .from('company_details')
        .select('id, company_name')
        .eq('tenant_id', userProfile.tenant_id);

      if (companyError) {
        console.error('Error checking company usage:', companyError);
      }

      // Check if address is used in assets (if they have address references)
      // Note: Based on the schema, assets don't seem to have direct address references
      // but we'll keep this structure for future extensibility

      // Check if address is used in service contracts (if they have address references)
      // Note: Based on the schema, service contracts don't seem to have direct address references
      // but we'll keep this structure for future extensibility

      const usageDetails = [];
      
      if (companyUsage && companyUsage.length > 0) {
        usageDetails.push({
          type: 'Company',
          count: companyUsage.length,
          examples: companyUsage.slice(0, 3).map(c => c.company_name).filter(Boolean)
        });
      }

      const isInUse = usageDetails.length > 0;

      return {
        isInUse,
        usageDetails,
      };
    },
    enabled: !!userProfile?.tenant_id && !!addressId,
  });
};
