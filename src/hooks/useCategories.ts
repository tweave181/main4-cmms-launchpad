
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

interface CreateCategoryData {
  name: string;
  description?: string;
  createPrefix?: boolean;
  prefix_letter?: string;
  number_code?: string;
  prefix_description?: string;
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

  const createCategory = useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      // Get current user's tenant_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.tenant_id) throw new Error('User tenant not found');

      // Create the category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          tenant_id: userData.tenant_id
        })
        .select()
        .single();
      
      if (categoryError) throw categoryError;

      // If createPrefix is true, also create the asset tag prefix
      if (categoryData.createPrefix && categoryData.prefix_letter && categoryData.number_code) {
        const { error: prefixError } = await supabase
          .from('asset_tag_prefixes')
          .insert({
            tenant_id: userData.tenant_id,
            category_id: category.id,
            prefix_letter: categoryData.prefix_letter.toUpperCase(),
            number_code: categoryData.number_code.padStart(3, '0'),
            description: categoryData.prefix_description || categoryData.name,
          });

        if (prefixError) {
          console.error('Error creating prefix:', prefixError);
          // Don't throw - category was created successfully
          toast.error('Category created but prefix creation failed');
        } else {
          // Invalidate prefix queries
          queryClient.invalidateQueries({ queryKey: ['assetPrefixes'] });
          queryClient.invalidateQueries({ queryKey: ['unlinkedCategories'] });
          queryClient.invalidateQueries({ queryKey: ['tenantSetupStatus'] });
        }
      }

      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    },
  });

  return {
    categories,
    isLoading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
