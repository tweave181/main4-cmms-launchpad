import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessType {
  id: string;
  name: string;
  category: string;
  sort_order: number;
}

export interface GroupedBusinessTypes {
  category: string;
  types: BusinessType[];
}

export const useBusinessTypes = () => {
  return useQuery({
    queryKey: ['business-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_types')
        .select('id, name, category, sort_order')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as BusinessType[];
    },
  });
};

export const useGroupedBusinessTypes = () => {
  const { data: businessTypes, ...rest } = useBusinessTypes();

  const grouped: GroupedBusinessTypes[] = [];
  
  if (businessTypes) {
    const categoryMap = new Map<string, BusinessType[]>();
    
    businessTypes.forEach((type) => {
      const existing = categoryMap.get(type.category) || [];
      existing.push(type);
      categoryMap.set(type.category, existing);
    });
    
    categoryMap.forEach((types, category) => {
      grouped.push({ category, types });
    });
  }

  return { data: grouped, ...rest };
};
