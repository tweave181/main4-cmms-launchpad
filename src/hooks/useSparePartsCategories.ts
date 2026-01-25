import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SparePartsCategory {
  id: string;
  name: string;
  description: string | null;
  sku_code: string | null;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.tenant_id) throw new Error('Tenant not found');

      // Generate SKU code from name
      const baseSkuCode = categoryData.name
        .replace(/[^A-Za-z]/g, '')
        .substring(0, 3)
        .toUpperCase();

      // Check for duplicate SKU codes and adjust if needed
      const { data: existingCodes } = await supabase
        .from('spare_parts_categories')
        .select('sku_code')
        .eq('tenant_id', userProfile.tenant_id)
        .like('sku_code', `${baseSkuCode.substring(0, 2)}%`);

      let finalSkuCode = baseSkuCode;
      if (existingCodes?.some(c => c.sku_code === baseSkuCode)) {
        for (let i = 2; i <= 9; i++) {
          const altCode = baseSkuCode.substring(0, 2) + i.toString();
          if (!existingCodes.some(c => c.sku_code === altCode)) {
            finalSkuCode = altCode;
            break;
          }
        }
      }

      const { data, error } = await supabase
        .from('spare_parts_categories')
        .insert({
          ...categoryData,
          tenant_id: userProfile.tenant_id,
          sku_code: finalSkuCode,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.tenant_id) throw new Error('Tenant not found');

      // Get existing SKU codes to avoid conflicts
      const { data: existingCodes } = await supabase
        .from('spare_parts_categories')
        .select('sku_code')
        .eq('tenant_id', userProfile.tenant_id);

      const usedCodes = new Set(existingCodes?.map(c => c.sku_code) || []);
      
      const categoriesWithTenant = categories.map(cat => {
        let skuCode = cat.name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
        
        // Handle conflicts
        if (usedCodes.has(skuCode)) {
          for (let i = 2; i <= 99; i++) {
            const altCode = i <= 9 
              ? skuCode.substring(0, 2) + i.toString()
              : skuCode.substring(0, 1) + i.toString();
            if (!usedCodes.has(altCode)) {
              skuCode = altCode;
              break;
            }
          }
        }
        usedCodes.add(skuCode);

        return {
          ...cat,
          tenant_id: userProfile.tenant_id,
          sku_code: skuCode,
        };
      });

      const { data, error } = await supabase
        .from('spare_parts_categories')
        .insert(categoriesWithTenant)
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