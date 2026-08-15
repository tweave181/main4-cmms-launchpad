import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface EquipmentCategory {
  id: string;
  tenant_id: string;
  category_name: string;
  description: string | null;
  prefix_letter: string;
  number_code: number;
  display_prefix: string;
  next_sequence: number;
  max_sequence: number;
  status: 'active' | 'inactive';
  icon: string | null;
  created_at: string;
  updated_at: string;
  asset_count?: number;
}

export interface EquipmentCategoryInput {
  category_name: string;
  description?: string | null;
  prefix_letter: string;
  number_code: number;
  icon?: string | null;
  status?: 'active' | 'inactive';
}

export const useEquipmentCategories = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = userProfile?.tenant_id;

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['equipmentCategories', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .order('prefix_letter', { ascending: true })
        .order('number_code', { ascending: true });

      if (error) throw error;

      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('equipment_category_id');

      if (assetsError) throw assetsError;

      const counts = new Map<string, number>();
      (assets || []).forEach((a) => {
        if (a.equipment_category_id) {
          counts.set(a.equipment_category_id, (counts.get(a.equipment_category_id) || 0) + 1);
        }
      });

      return (data || []).map((row) => ({
        ...row,
        asset_count: counts.get(row.id) || 0,
      })) as EquipmentCategory[];
    },
    enabled: !!tenantId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['equipmentCategories'] });
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  };

  const createCategory = useMutation({
    mutationFn: async (input: EquipmentCategoryInput) => {
      if (!tenantId) throw new Error('Tenant not found');
      const { data, error } = await supabase
        .from('equipment_categories')
        .insert({
          tenant_id: tenantId,
          category_name: input.category_name.trim(),
          description: input.description?.trim() || null,
          prefix_letter: input.prefix_letter.toUpperCase(),
          number_code: input.number_code,
          icon: input.icon || null,
          status: input.status || 'active',
          created_by: userProfile?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Equipment category created');
    },
    onError: (err: any) => {
      toast.error(err?.message?.includes('duplicate') ? 'That name or prefix is already in use' : 'Failed to create equipment category');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...input }: EquipmentCategoryInput & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment_categories')
        .update({
          category_name: input.category_name.trim(),
          description: input.description?.trim() || null,
          prefix_letter: input.prefix_letter.toUpperCase(),
          number_code: input.number_code,
          icon: input.icon || null,
          status: input.status || 'active',
          updated_by: userProfile?.id ?? null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Equipment category updated');
    },
    onError: (err: any) => {
      toast.error(err?.message?.includes('duplicate') ? 'That name or prefix is already in use' : 'Failed to update equipment category');
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('equipment_categories')
        .update({ status, updated_by: userProfile?.id ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.status === 'active' ? 'Category reactivated' : 'Category deactivated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const activeCategories = categories.filter(
    (c) => c.status === 'active' && c.next_sequence <= c.max_sequence
  );

  const suggestNumberCode = (prefixLetter: string) => {
    const used = new Set(
      categories
        .filter((c) => c.prefix_letter === prefixLetter.toUpperCase())
        .map((c) => c.number_code)
    );
    for (let i = 1; i <= 999; i++) {
      if (!used.has(i)) return i;
    }
    return null;
  };

  return {
    categories,
    activeCategories,
    isLoading,
    error,
    refetch,
    createCategory,
    updateCategory,
    setStatus,
    suggestNumberCode,
  };
};

export const previewNextAssetTag = async (equipmentCategoryId: string) => {
  const { data, error } = await supabase.rpc('preview_next_asset_tag', {
    _equipment_category_id: equipmentCategoryId,
  });
  if (error) throw error;
  return data as string | null;
};

export const reserveAssetTag = async (equipmentCategoryId: string) => {
  const { data, error } = await supabase.rpc('reserve_asset_tag', {
    _equipment_category_id: equipmentCategoryId,
  });
  if (error) throw error;
  return data as string;
};
