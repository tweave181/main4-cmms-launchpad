
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useNextNumberCode = (prefixLetter: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['nextNumberCode', prefixLetter, userProfile?.tenant_id],
    queryFn: async () => {
      if (!prefixLetter || !userProfile?.tenant_id) {
        return 1;
      }

      // Get all existing number codes for this prefix letter
      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .select('number_code')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('prefix_letter', prefixLetter.toUpperCase())
        .order('number_code', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return 1;
      }

      // Convert to numbers and find the next available
      const existingCodes = data.map(item => parseInt(item.number_code));
      
      for (let i = 1; i <= 999; i++) {
        if (!existingCodes.includes(i)) {
          return i;
        }
      }

      return null; // All numbers taken
    },
    enabled: !!prefixLetter && !!userProfile?.tenant_id,
  });
};

// Helper function to calculate next number for a letter given existing allocations
export const calculateNextNumber = (
  prefixLetter: string,
  existingPrefixes: { prefix_letter: string; number_code: string }[],
  pendingAllocations: { prefix_letter: string; number_code: string }[]
): number => {
  const letter = prefixLetter.toUpperCase();
  
  // Combine existing DB prefixes and pending allocations for this letter
  const usedNumbers = new Set<number>();
  
  existingPrefixes
    .filter(p => p.prefix_letter === letter)
    .forEach(p => usedNumbers.add(parseInt(p.number_code)));
    
  pendingAllocations
    .filter(p => p.prefix_letter === letter)
    .forEach(p => usedNumbers.add(parseInt(p.number_code)));

  // Find next available number
  for (let i = 1; i <= 999; i++) {
    if (!usedNumbers.has(i)) {
      return i;
    }
  }

  return 1; // Fallback
};
