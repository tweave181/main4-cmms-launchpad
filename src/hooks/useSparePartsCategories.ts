import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SparePartsCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useSparePartsCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['spare-parts-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as SparePartsCategory[];
    },
  });

  const { data: activeCategories = [] } = useQuery({
    queryKey: ['spare-parts-categories', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as SparePartsCategory[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: { name: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .insert({
          ...categoryData,
          is_active: categoryData.is_active ?? true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-parts-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-parts-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      // Check if category is in use first
      const { data: usage, error: usageError } = await supabase
        .from('inventory_parts')
        .select('id')
        .eq('spare_parts_category_id', id)
        .limit(1);

      if (usageError) throw usageError;
      if (usage && usage.length > 0) {
        throw new Error('Cannot delete category that is currently in use by inventory parts');
      }

      const { error } = await supabase
        .from('spare_parts_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-parts-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    },
  });

  const importCategories = useMutation({
    mutationFn: async (categories: Array<{ name: string; description?: string; is_active?: boolean }>) => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .insert(categories)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spare-parts-categories'] });
      toast.success(`Successfully imported ${data.length} categories`);
    },
    onError: (error) => {
      console.error('Error importing categories:', error);
      toast.error('Failed to import categories');
    },
  });

  return {
    categories,
    activeCategories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    importCategories,
  };
};