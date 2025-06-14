
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { UserProfile } from '../types';

// Helper function to create missing profile using session data
export const createMissingProfile = async (session: any): Promise<UserProfile> => {
  try {
    console.log('Creating missing profile for user:', session.user.id);
    
    const tenantId = session.user.user_metadata?.tenant_id;
    if (!tenantId) {
      throw new Error('No tenant_id found in session metadata');
    }

    const profileData = {
      id: session.user.id,
      tenant_id: tenantId,
      email: session.user.email,
      name: session.user.user_metadata?.name || 'User',
      role: session.user.user_metadata?.role || 'technician'
    };

    console.log('Inserting profile data:', profileData);

    const { data: newProfile, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create missing profile:', error);
      throw error;
    }

    console.log('Successfully created missing profile:', newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error in createMissingProfile:', error);
    throw error;
  }
};

// Helper function to retry profile fetch with exponential backoff
export const fetchProfileWithRetry = async (userId: string, maxRetries = 3): Promise<UserProfile | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Profile fetch attempt ${attempt}/${maxRetries} for user:`, userId);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(`Profile fetch attempt ${attempt} failed:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff: 500ms, 1s, 2s)
        const delay = Math.pow(2, attempt - 1) * 500;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (profile) {
        console.log(`Profile fetch successful on attempt ${attempt}:`, profile);
        return profile;
      } else {
        console.log(`Profile fetch attempt ${attempt} returned null`);
        if (attempt === maxRetries) {
          return null;
        }
      }
    } catch (error) {
      console.error(`Profile fetch attempt ${attempt} threw error:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      const delay = Math.pow(2, attempt - 1) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
};

// Helper function to fetch tenant data
export const fetchTenantData = async (tenantId: string) => {
  console.log('Fetching tenant data for:', tenantId);
  
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (tenantError) {
    console.error('Error fetching tenant:', tenantError);
    toast({
      title: "Organization Data Error",
      description: "Unable to load organization information.",
      variant: "destructive",
    });
    throw tenantError;
  }

  console.log('Tenant data fetched successfully:', tenantData);
  return tenantData;
};
