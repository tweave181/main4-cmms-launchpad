
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { UserProfile, Tenant } from './types';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log(`Fetching user profile for ${userId}, attempt ${retryCount + 1}`);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying profile fetch in ${retryDelay}ms...`);
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, retryDelay);
          return;
        }
        
        toast({
          title: "Profile Error",
          description: "Unable to load user profile. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        
        if (retryCount < maxRetries) {
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, retryDelay);
          return;
        }
        
        toast({
          title: "Profile Error",
          description: "User profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('User profile fetched successfully:', profile);
      setUserProfile(profile);

      // Fetch tenant data
      if (profile?.tenant_id) {
        console.log('Fetching tenant data for:', profile.tenant_id);
        
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          toast({
            title: "Tenant Error",
            description: "Unable to load organization data.",
            variant: "destructive",
          });
        } else {
          console.log('Tenant data fetched successfully:', tenantData);
          setTenant(tenantData);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
    }
  };

  const clearUserData = () => {
    setUserProfile(null);
    setTenant(null);
  };

  return {
    userProfile,
    tenant,
    fetchUserProfile,
    clearUserData
  };
};
