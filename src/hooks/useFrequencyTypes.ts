import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FrequencyType {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFrequencyTypes = () => {
  return useQuery({
    queryKey: ['frequency-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('frequency_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as FrequencyType[];
    },
  });
};

export const useCreateFrequencyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; sort_order: number; is_active: boolean }) => {
      // tenant_id is now nullable for global frequency types
      const { data: result, error } = await supabase
        .from('frequency_types')
        .insert([{ ...data, tenant_id: null }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequency-types'] });
      toast.success('Frequency type created successfully');
    },
    onError: (error) => {
      console.error('Error creating frequency type:', error);
      toast.error('Failed to create frequency type');
    },
  });
};

export const useUpdateFrequencyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string; sort_order?: number; is_active?: boolean } }) => {
      const { error } = await supabase
        .from('frequency_types')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequency-types'] });
      toast.success('Frequency type updated successfully');
    },
    onError: (error) => {
      console.error('Error updating frequency type:', error);
      toast.error('Failed to update frequency type');
    },
  });
};

export const useDeleteFrequencyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('frequency_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequency-types'] });
      toast.success('Frequency type deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting frequency type:', error);
      toast.error('Failed to delete frequency type');
    },
  });
};
