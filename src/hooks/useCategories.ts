import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Note: Category creation can be added later if needed through admin interface

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
};