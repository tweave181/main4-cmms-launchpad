import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface ExpiringContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  end_date: string;
  reminder_days_before: number | null;
}

export const useExpiringContractsForNotification = () => {
  const { userProfile } = useAuth();

  const { data: expiringContracts = [], isLoading } = useQuery({
    queryKey: ['expiring-contracts-notification', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Get contracts that are within their reminder window
      const { data: contracts, error } = await supabase
        .from('service_contracts')
        .select(`
          id,
          contract_title,
          vendor_name,
          end_date,
          reminder_days_before
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .not('reminder_days_before', 'is', null)
        .gte('end_date', new Date().toISOString().split('T')[0]); // Not expired yet

      if (error) {
        console.error('Error fetching contracts for notification:', error);
        throw error;
      }

      if (!contracts) return [];

      // Filter contracts that are within their reminder window
      const today = new Date();
      const contractsInReminderWindow = contracts.filter(contract => {
        if (!contract.reminder_days_before) return false;
        
        const endDate = new Date(contract.end_date);
        const reminderDate = new Date(endDate);
        reminderDate.setDate(endDate.getDate() - contract.reminder_days_before);
        
        // Check if today is on or after the reminder date
        return today >= reminderDate;
      });

      return contractsInReminderWindow;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return {
    expiringContracts,
    isLoading,
    hasExpiringContracts: expiringContracts.length > 0,
  };
};