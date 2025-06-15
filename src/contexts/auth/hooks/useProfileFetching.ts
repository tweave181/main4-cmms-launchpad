import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
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
      return;
    }

    try {
      setProfileLoading(true);

      // Validate session and JWT claims
      const session = await validateSessionAndClaims(userId);

      // Attempt to fetch user profile with retry logic (wrap in try/catch for token/401/403 error)
      let profile;
      try {
        try {
          profile = await fetchProfileWithRetry(userId);
        } catch (error: any) {
          // Handle common errors for invalid/expired session and propagate as needed
          if (
            error?.status === 401 ||
            error?.status === 403 ||
            error?.status === 400 ||
            (typeof error.message === "string" &&
              (
                error.message.toLowerCase().includes("token") ||
                error.message.toLowerCase().includes("refresh") ||
                error.message.toLowerCase().includes("expired") ||
                error.message.toLowerCase().includes("session")
              )
            )
          ) {
            throw new Error("SESSION_EXPIRED");
          }
          throw error;
        }
      } catch (error: any) {
        // Handle specific error types
        if (error.message === "SESSION_EXPIRED") {
          setProfileLoading(false);
          throw { status: 401, message: "Session expired." };
        }
        // Handle specific error types
        if (error.message === 'PROFILE_NOT_FOUND') {
          try {
            profile = await createMissingProfile(session);
          } catch (createError: any) {
            setProfileLoading(false);
            throw new Error('Unable to create your profile. Please contact support for assistance.');
          }
        } else if (error.message === 'PROFILE_ACCESS_DENIED') {
          setProfileLoading(false);
          throw new Error('You do not have permission to access this profile. Please contact an administrator.');
        } else {
          setProfileLoading(false);
          throw new Error('Unable to access your profile. Please try again or contact support if the problem persists.');
        }
      }

      if (!profile) {
        setProfileLoading(false);
        throw new Error('Your user profile could not be found or created. Please contact support.');
      }

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
            title: "Organization Data Warning",
            description: "Unable to load organization information, but you can still use the app.",
            variant: "destructive",
          });
        }
      }
      setProfileLoading(false);
    } catch (error: any) {
      setUserProfile(null);
      setTenant(null);
      setLastFetchedUserId(null);
      setProfileLoading(false);
      throw error;
    }
  }, [lastFetchedUserId]);

  const clearUserData = useCallback(() => {
    setLastFetchedUserId(null);
  }, []);

  return {
    profileLoading,
    fetchUserProfile,
    clearUserData
  };
};
