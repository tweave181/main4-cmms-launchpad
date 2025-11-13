
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandling';
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

export const useInventoryParts = (inventoryType?: 'spare_parts' | 'consumables') => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: parts, isLoading, refetch } = useQuery({
    queryKey: ['inventory-parts', userProfile?.tenant_id, inventoryType],
    queryFn: async () => {
      let query = supabase
        .from('inventory_parts')
        .select(`
          *,
          spare_parts_categories (
            name
          ),
          addresses!supplier_id (
            company_details!addresses_company_id_fkey (
              company_name
            )
          )
        `);
      
      if (inventoryType) {
        query = query.eq('inventory_type', inventoryType);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        spare_parts_category: item.spare_parts_categories ? {
          name: item.spare_parts_categories.name,
        } : undefined,
        supplier: item.addresses?.company_details ? {
          company_name: item.addresses.company_details.company_name,
        } : undefined
      })) || [];
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
      showSuccessToast("Part created successfully");
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Create Failed', context: 'Inventory Part' });
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: async ({ id, updates, previousStock }: { id: string; updates: InventoryPartUpdate; previousStock?: number }) => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          spare_parts_categories (
            name
          ),
          addresses!supplier_id (
            company_details!addresses_company_id_fkey (
              company_name,
              email
            )
          )
        `)
        .single();

      if (error) throw error;
      return { data, previousStock };
    },
    onSuccess: async ({ data, previousStock }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      showSuccessToast("Part updated successfully");

      // Check if we should trigger low stock alert
      const currentStock = data.quantity_in_stock;
      const reorderThreshold = data.reorder_threshold;

      // Only trigger if stock is now at or below threshold AND was previously above it
      if (
        currentStock <= reorderThreshold &&
        previousStock !== undefined &&
        previousStock > reorderThreshold
      ) {
        const { areLowStockAlertsEnabled, triggerLowStockAlert } = await import('@/utils/notificationHelpers');
        
        const alertsEnabled = await areLowStockAlertsEnabled(data.tenant_id);
        
        if (alertsEnabled) {
          console.log('Triggering low stock alert for part:', data.name);
          
          try {
            await triggerLowStockAlert({
              partId: data.id,
              partName: data.name,
              sku: data.sku,
              currentStock: currentStock,
              reorderThreshold: reorderThreshold,
              unitOfMeasure: data.unit_of_measure,
              category: data.spare_parts_categories?.name,
              supplierName: data.addresses?.company_details?.company_name,
              supplierEmail: data.addresses?.company_details?.email,
              tenantId: data.tenant_id,
            });
          } catch (error) {
            console.error('Failed to send low stock alert:', error);
            // Don't throw - we don't want to fail the update if email fails
          }
        }
      }
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Update Failed', context: 'Inventory Part' });
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
      showSuccessToast("Part deleted successfully");
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Delete Failed', context: 'Inventory Part' });
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
      showSuccessToast("Stock updated successfully");
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Stock Update Failed', context: 'Inventory' });
    },
  });

  return {
    parts: parts || [],
    isLoading,
    refetch,
    createPart: createPartMutation.mutateAsync,
    updatePart: (params: { id: string; updates: InventoryPartUpdate; previousStock?: number }) => 
      updatePartMutation.mutate(params),
    deletePart: deletePartMutation.mutate,
    createStockTransaction: createStockTransactionMutation.mutate,
    isCreating: createPartMutation.isPending,
    isUpdating: updatePartMutation.isPending,
    isDeleting: deletePartMutation.isPending,
  };
};
