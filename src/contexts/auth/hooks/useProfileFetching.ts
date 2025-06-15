
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { UserProfile } from '../types';
import { 
  createMissingProfile, 
  fetchProfileWithRetry, 
  fetchTenantData 
} from '../utils/profileHelpers';
import { validateSessionAndClaims } from '../utils/sessionValidation';

export const useProfileFetching = () => {
  const [profileLoading, setProfileLoading] = useState(false);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (
    userId: string,
    userProfile: UserProfile | null,
    setUserProfile: (profile: UserProfile | null) => void,
    setTenant: (tenant: any) => void
  ) => {
    // Prevent duplicate fetches for the same user
    if (lastFetchedUserId === userId && userProfile) {
      console.log('Profile already fetched for this user, skipping');
      return;
    }

    try {
      setProfileLoading(true);
      
      // Validate session and JWT claims
      const session = await validateSessionAndClaims(userId);

      // Attempt to fetch user profile with retry logic
      let profile;
      try {
        profile = await fetchProfileWithRetry(userId);
      } catch (error: any) {
        console.error('Profile fetch failed after all retries:', error);

        // Check if this is a "row not found" error (PGRST116 or similar)
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          console.log('Profile not found, attempting to create missing profile...');
          
          try {
            profile = await createMissingProfile(session);
            console.log('Successfully created and retrieved missing profile');
          } catch (createError: any) {
            console.error('Failed to create missing profile:', createError);
            // Don't show toast here, let the parent component handle the error state
            setProfileLoading(false);
            throw new Error('Unable to create your profile. Please contact support.');
          }
        } else {
          // Some other error occurred - this could be a permissions issue
          console.error('Profile access error:', error);
          setProfileLoading(false);
          throw new Error(error.message || 'Unable to access your profile. Please try again or contact support.');
        }
      }

      if (!profile) {
        console.error('No profile found and creation failed for user:', userId);
        setProfileLoading(false);
        throw new Error('Your user profile was not found. Please contact support.');
      }

      console.log('User profile ready:', profile);
      setUserProfile(profile);
      setLastFetchedUserId(userId);

      // Fetch tenant data using the new JWT-based policy
      if (profile?.tenant_id) {
        try {
          const tenantData = await fetchTenantData(profile.tenant_id);
          setTenant(tenantData);
        } catch (tenantError: any) {
          console.error('Error fetching tenant data:', tenantError);
          // Don't fail the entire profile fetch for tenant errors
          toast({
            title: "Organization Data Error",
            description: "Unable to load organization information.",
            variant: "destructive",
          });
        }
      }
      
      console.log('=== Profile fetch completed successfully ===');
      setProfileLoading(false);
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
      setLastFetchedUserId(null);
      setProfileLoading(false);
      // Re-throw the error so the parent can handle it
      throw error;
    }
  }, [lastFetchedUserId]);

  const clearUserData = useCallback(() => {
    console.log('Clearing user data');
    setLastFetchedUserId(null);
  }, []);

  return {
    profileLoading,
    fetchUserProfile,
    clearUserData
  };
};
