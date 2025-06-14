
import { useState, useCallback } from 'react';
import type { UserProfile, Tenant } from './types';
import { useProfileFetching } from './hooks/useProfileFetching';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  const { 
    profileLoading, 
    profileError,
    fetchUserProfile: fetchProfile, 
    clearUserData: clearFetchingData 
  } = useProfileFetching();

  const fetchUserProfile = useCallback(async (userId: string) => {
    await fetchProfile(userId, userProfile, setUserProfile, setTenant);
  }, [fetchProfile, userProfile]);

  const clearUserData = useCallback(() => {
    console.log('Clearing user data');
    setUserProfile(null);
    setTenant(null);
    clearFetchingData();
  }, [clearFetchingData]);

  return {
    userProfile,
    tenant,
    profileLoading,
    profileError,
    fetchUserProfile,
    clearUserData
  };
};
