
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'] & {
  spare_parts_category?: {
    name: string;
  };
  supplier?: {
    company_name: string;
  };
};
type InventoryPartInsert = Database['public']['Tables']['inventory_parts']['Insert'];
type InventoryPartUpdate = Database['public']['Tables']['inventory_parts']['Update'];

export const useInventoryParts = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: parts, isLoading, refetch } = useQuery({
    queryKey: ['inventory-parts', userProfile?.tenant_id],
    queryFn: async () => {
      console.log('🔍 Fetching inventory parts for tenant:', userProfile?.tenant_id);
      console.log('🔍 User profile:', userProfile);
      
      // Start with a simple query first
      const { data, error } = await supabase
        .from('inventory_parts')
        .select('*')
        .order('name');

      console.log('🔍 Inventory parts query result:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Error fetching inventory parts:', error);
        alert(`Database Error: ${error.message}`);
        throw error;
      }
      
      console.log('✅ Found parts:', data?.length);
      if (data?.length === 0) {
        console.log('⚠️ No parts found - checking RLS policies');
        alert(`No inventory parts found. User tenant: ${userProfile?.tenant_id}, User role: ${userProfile?.role}`);
      }
      
      // Return simple data for now, we'll add related data back later
      return (data || []) as InventoryPart[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const createPartMutation = useMutation({
    mutationFn: async (newPart: Omit<InventoryPartInsert, 'tenant_id' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .insert({
          ...newPart,
          tenant_id: userProfile!.tenant_id,
          created_by: userProfile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: "Success",
        description: "Part created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InventoryPartUpdate }) => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      if (!confirm('Are you sure you want to delete this part?')) return;

      const { error } = await supabase
        .from('inventory_parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createStockTransactionMutation = useMutation({
    mutationFn: async ({
      partId,
      transactionType,
      quantityChange,
      quantityAfter,
      notes,
    }: {
      partId: string;
      transactionType: Database['public']['Enums']['stock_transaction_type'];
      quantityChange: number;
      quantityAfter: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('stock_transactions')
        .insert({
          part_id: partId,
          transaction_type: transactionType,
          quantity_change: quantityChange,
          quantity_after: quantityAfter,
          notes,
          created_by: userProfile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    parts: parts || [],
    isLoading,
    refetch,
    createPart: createPartMutation.mutateAsync,
    updatePart: updatePartMutation.mutate,
    deletePart: deletePartMutation.mutate,
    createStockTransaction: createStockTransactionMutation.mutate,
    isCreating: createPartMutation.isPending,
    isUpdating: updatePartMutation.isPending,
    isDeleting: deletePartMutation.isPending,
  };
};
