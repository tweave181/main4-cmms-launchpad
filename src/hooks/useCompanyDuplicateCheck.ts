import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface DuplicateCheckResult {
  exists: boolean;
  message?: string;
}

export const useCompanyDuplicateCheck = () => {
  const { userProfile } = useAuth();

  const checkCompanyNameExists = useCallback(async (
    name: string, 
    excludeId?: string
  ): Promise<DuplicateCheckResult> => {
    if (!name?.trim()) {
      return { exists: false };
    }

    if (!userProfile?.tenant_id) {
      return { exists: false };
    }

    try {
      let query = supabase
        .from('company_details')
        .select('id, company_name')
        .eq('tenant_id', userProfile.tenant_id)
        .ilike('company_name', name.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking company name:', error);
        return { exists: false };
      }

      const exists = data && data.length > 0;
      return {
        exists,
        message: exists ? `A company named "${name.trim()}" already exists.` : undefined
      };
    } catch (error) {
      console.error('Error in duplicate check:', error);
      return { exists: false };
    }
  }, [userProfile?.tenant_id]);

  return { checkCompanyNameExists };
};