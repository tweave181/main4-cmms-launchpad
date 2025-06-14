
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
          } catch (createError) {
            console.error('Failed to create missing profile:', createError);
            toast({
              title: "Profile Creation Error",
              description: "Unable to create your profile. Please contact support.",
              variant: "destructive",
            });
            setProfileLoading(false);
            return;
          }
        } else {
          // Some other error occurred
          toast({
            title: "Profile Loading Error",
            description: "Unable to load your profile. Please try logging in again.",
            variant: "destructive",
          });
          setProfileLoading(false);
          throw error;
        }
      }

      if (!profile) {
        console.error('No profile found and creation failed for user:', userId);
        toast({
          title: "Profile Not Found",
          description: "Your user profile was not found. Please contact support.",
          variant: "destructive",
        });
        setProfileLoading(false);
        return;
      }

      console.log('User profile ready:', profile);
      setUserProfile(profile);
      setLastFetchedUserId(userId);

      // Fetch tenant data using the new JWT-based policy
      if (profile?.tenant_id) {
        try {
          const tenantData = await fetchTenantData(profile.tenant_id);
          setTenant(tenantData);
        } catch (tenantError) {
          // Error already handled in fetchTenantData
        }
      }
      
      console.log('=== Profile fetch completed successfully ===');
      setProfileLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
      setLastFetchedUserId(null);
      setProfileLoading(false);
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
