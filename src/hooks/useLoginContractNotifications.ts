import { useEffect, useRef } from 'react';
import { useExpiringContractsForNotification } from './useExpiringContractsForNotification';
import { useContractReminderNotifications } from './useContractReminderNotifications';

export const useLoginContractNotifications = (isReady: boolean, userProfile: any) => {
  const { expiringContracts, hasExpiringContracts } = useExpiringContractsForNotification();
  const { showContractReminderToast } = useContractReminderNotifications();
  const notificationShown = useRef(false);

  useEffect(() => {
    // Only trigger once per session when user is ready and has a profile
    if (isReady && userProfile && hasExpiringContracts && !notificationShown.current) {
      console.log('Checking for contract reminders on login...');
      showContractReminderToast(expiringContracts);
      notificationShown.current = true;
    }
  }, [isReady, userProfile, hasExpiringContracts, expiringContracts, showContractReminderToast]);

  // Reset notification flag when user changes (new login)
  useEffect(() => {
    if (!userProfile) {
      notificationShown.current = false;
    }
  }, [userProfile?.id]);
};