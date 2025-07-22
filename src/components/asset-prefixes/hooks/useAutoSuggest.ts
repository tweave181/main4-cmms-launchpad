
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface UseAutoSuggestProps {
  prefixLetter: string;
  enabled: boolean;
}

export const useAutoSuggest = ({ prefixLetter, enabled }: UseAutoSuggestProps) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['autoSuggest', prefixLetter, userProfile?.tenant_id],
    queryFn: async () => {
      if (!prefixLetter || !userProfile?.tenant_id) {
        return 1;
      }

      // Get all existing number codes for this prefix letter
      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .select('number_code')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('prefix_letter', prefixLetter)
        .order('number_code', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return 1; // First prefix for this letter
      }

      // Convert to numbers and find the next available
      const existingCodes = data.map(item => parseInt(item.number_code));
      
      // Find the first gap or next number
      for (let i = 1; i <= 999; i++) {
        if (!existingCodes.includes(i)) {
          return i;
        }
      }

      // If all numbers are taken (highly unlikely)
      return null;
    },
    enabled: enabled && !!(prefixLetter && userProfile?.tenant_id),
  });
};
