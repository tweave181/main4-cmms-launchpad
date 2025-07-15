import React, { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const useContractReminderNotifications = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const logReminder = useCallback(async (
    contractId: string,
    deliveryMethod: 'toast' | 'email'
  ) => {
    if (!userProfile?.id || !userProfile?.tenant_id) return;

    try {
      await supabase
        .from('contract_reminders_log')
        .insert({
          contract_id: contractId,
          user_id: userProfile.id,
          delivery_method: deliveryMethod,
          tenant_id: userProfile.tenant_id,
        });
    } catch (error) {
      console.error('Error logging contract reminder:', error);
    }
  }, [userProfile]);

  const checkForDuplicateToast = useCallback(async (contractIds: string[]) => {
    if (!userProfile?.id || contractIds.length === 0) return false;

    // Check if we've already shown a toast for any of these contracts today
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('contract_reminders_log')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('delivery_method', 'toast')
      .gte('reminder_date', today)
      .in('contract_id', contractIds)
      .limit(1);

    if (error) {
      console.error('Error checking for duplicate toast:', error);
      return false;
    }

    return (data && data.length > 0);
  }, [userProfile]);

  const showContractReminderToast = useCallback(async (expiringContracts: any[]) => {
    if (expiringContracts.length === 0) return;

    const contractIds = expiringContracts.map(c => c.id);
    
    // Check if we've already shown a toast today
    const alreadyShown = await checkForDuplicateToast(contractIds);
    if (alreadyShown) return;

    const count = expiringContracts.length;
    const message = count === 1 
      ? `⚠️ 1 contract is expiring soon. View details`
      : `⚠️ ${count} contracts are expiring soon. View details`;

    toast({
      title: "Contract Renewal Reminder",
      description: message,
      action: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/vendors')}
        >
          View Contracts
        </Button>
      ),
      duration: 10000, // Show for 10 seconds
    });

    // Log the reminder for the first contract (representative)
    if (expiringContracts.length > 0) {
      await logReminder(expiringContracts[0].id, 'toast');
    }
  }, [checkForDuplicateToast, logReminder, toast, navigate]);

  return {
    showContractReminderToast,
    logReminder,
  };
};