import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useLoginContractNotifications } from '@/hooks/useLoginContractNotifications';

export const ContractNotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, profileStatus, userProfile } = useAuth();
  
  // Check for contract notifications on login
  useLoginContractNotifications(ready && profileStatus === 'ready', userProfile);

  return <>{children}</>;
};