import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface ServiceContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  vendor_company_id: string | null;
  start_date: string;
  end_date: string;
  contract_cost: number | null;
  status: string;
  description: string | null;
  email_reminder_enabled: boolean;
  reminder_days_before: number | null;
  visit_count: number | null;
  company_details?: {
    id: string;
    company_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const useAddressContracts = (addressId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['address-contracts', addressId],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('service_contracts')
        .select(`
          id,
          contract_title,
          vendor_name,
          vendor_company_id,
          start_date,
          end_date,
          contract_cost,
          status,
          description,
          email_reminder_enabled,
          reminder_days_before,
          visit_count,
          company_details:vendor_company_id (
            id,
            company_name,
            email,
            phone
          )
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .eq('address_id', addressId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching address contracts:', error);
        throw error;
      }

      return data as ServiceContract[];
    },
    enabled: !!userProfile?.tenant_id && !!addressId,
  });
};