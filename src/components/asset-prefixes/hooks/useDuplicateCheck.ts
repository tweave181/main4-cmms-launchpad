
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface UseDuplicateCheckProps {
  prefixLetter: string;
  numberCode: string;
  excludeId?: string;
}

export const useDuplicateCheck = ({ prefixLetter, numberCode, excludeId }: UseDuplicateCheckProps) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['duplicateCheck', prefixLetter, numberCode, excludeId, userProfile?.tenant_id],
    queryFn: async () => {
      if (!prefixLetter || !numberCode || !userProfile?.tenant_id) {
        return false;
      }

      // Convert single digit to padded format for database check
      const paddedCode = parseInt(numberCode).toString().padStart(3, '0');

      let query = supabase
        .from('asset_tag_prefixes')
        .select('id')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('prefix_letter', prefixLetter)
        .eq('number_code', paddedCode);

      // Exclude current record when editing
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.limit(1);

      if (error) throw error;

      return data && data.length > 0;
    },
    enabled: !!(prefixLetter && numberCode && userProfile?.tenant_id),
  });
};
