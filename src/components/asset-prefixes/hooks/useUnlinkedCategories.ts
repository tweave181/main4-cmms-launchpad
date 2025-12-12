
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface UnlinkedCategory {
  id: string;
  name: string;
  description: string | null;
}

export const useUnlinkedCategories = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['unlinkedCategories', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        return [];
      }

      // Get all categories for this tenant
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('tenant_id', userProfile.tenant_id)
        .order('name');

      if (catError) throw catError;

      // Get all prefixes with category_id for this tenant
      const { data: prefixes, error: prefixError } = await supabase
        .from('asset_tag_prefixes')
        .select('category_id')
        .eq('tenant_id', userProfile.tenant_id)
        .not('category_id', 'is', null);

      if (prefixError) throw prefixError;

      // Get set of category IDs that already have prefixes
      const linkedCategoryIds = new Set(prefixes?.map(p => p.category_id) || []);

      // Filter to categories without prefixes
      const unlinkedCategories = (categories || []).filter(
        cat => !linkedCategoryIds.has(cat.id)
      );

      return unlinkedCategories as UnlinkedCategory[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};
