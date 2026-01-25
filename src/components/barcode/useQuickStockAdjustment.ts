import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type StockTransactionType = Database['public']['Enums']['stock_transaction_type'];

interface StockAdjustmentParams {
  partId: string;
  transactionType: 'restock' | 'usage';
  quantityChange: number;
  quantityAfter: number;
  notes?: string;
}

export const useQuickStockAdjustment = () => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { userProfile } = useAuth();

  const adjustStock = async ({
    partId,
    transactionType,
    quantityChange,
    quantityAfter,
    notes,
  }: StockAdjustmentParams): Promise<boolean> => {
    if (!userProfile?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to adjust stock',
        variant: 'destructive',
      });
      return false;
    }

    setIsAdjusting(true);

    try {
      // Get current part data for low stock alert check
      const { data: currentPart, error: fetchError } = await supabase
        .from('inventory_parts')
        .select('quantity_in_stock, reorder_threshold, name, sku, unit_of_measure, tenant_id')
        .eq('id', partId)
        .single();

      if (fetchError) throw fetchError;

      const previousStock = currentPart.quantity_in_stock;

      // Update the inventory part's quantity
      const { error: updateError } = await supabase
        .from('inventory_parts')
        .update({ quantity_in_stock: quantityAfter })
        .eq('id', partId);

      if (updateError) throw updateError;

      // Create stock transaction record
      const signedChange = transactionType === 'restock' ? quantityChange : -quantityChange;

      const { error: transactionError } = await supabase
        .from('stock_transactions')
        .insert({
          part_id: partId,
          transaction_type: transactionType as StockTransactionType,
          quantity_change: signedChange,
          quantity_after: quantityAfter,
          notes,
          created_by: userProfile.id,
        });

      if (transactionError) throw transactionError;

      // Show success message
      const action = transactionType === 'restock' ? 'added' : 'removed';
      toast({
        title: 'Stock Updated',
        description: `${quantityChange} ${action}. New total: ${quantityAfter}`,
      });

      // Check for low stock alert trigger
      if (
        quantityAfter <= currentPart.reorder_threshold &&
        previousStock > currentPart.reorder_threshold
      ) {
        // Dynamically import to avoid circular dependencies
        const { areLowStockAlertsEnabled, triggerLowStockAlert } = await import(
          '@/utils/notificationHelpers'
        );

        const alertsEnabled = await areLowStockAlertsEnabled(currentPart.tenant_id);

        if (alertsEnabled) {
          try {
            await triggerLowStockAlert({
              partId,
              partName: currentPart.name,
              sku: currentPart.sku,
              currentStock: quantityAfter,
              reorderThreshold: currentPart.reorder_threshold,
              unitOfMeasure: currentPart.unit_of_measure,
              tenantId: currentPart.tenant_id,
            });
          } catch (alertError) {
            console.error('Failed to send low stock alert:', alertError);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Stock adjustment error:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update stock. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsAdjusting(false);
    }
  };

  return { adjustStock, isAdjusting };
};
