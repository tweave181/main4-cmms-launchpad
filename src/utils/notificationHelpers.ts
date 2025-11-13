import { supabase } from '@/integrations/supabase/client';

export interface NotificationRecipient {
  id: string;
  email: string;
  name: string;
}

/**
 * Fetches users who should receive inventory notifications
 * Currently returns all admin users for the given tenant
 */
export async function getInventoryNotificationRecipients(
  tenantId: string
): Promise<NotificationRecipient[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('tenant_id', tenantId)
      .eq('role', 'admin')
      .not('email', 'is', null);

    if (error) {
      console.error('Error fetching notification recipients:', error);
      return [];
    }

    return users as NotificationRecipient[];
  } catch (error) {
    console.error('Error in getInventoryNotificationRecipients:', error);
    return [];
  }
}

/**
 * Checks if low stock notifications are enabled for the given tenant
 */
export async function areLowStockAlertsEnabled(
  tenantId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('low_stock_alerts_enabled')
      .eq('tenant_id', tenantId)
      .is('user_id', null)
      .single();

    if (error) {
      console.error('Error checking notification settings:', error);
      return true; // Default to enabled if settings don't exist
    }

    return data?.low_stock_alerts_enabled ?? true;
  } catch (error) {
    console.error('Error in areLowStockAlertsEnabled:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Triggers a low stock alert email
 */
export async function triggerLowStockAlert(params: {
  partId: string;
  partName: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
  unitOfMeasure: string;
  category?: string;
  supplierName?: string;
  supplierEmail?: string;
  tenantId: string;
}): Promise<void> {
  try {
    console.log('Triggering low stock alert for:', params.partName);

    const { data, error } = await supabase.functions.invoke('send-low-stock-alert', {
      body: {
        part_id: params.partId,
        part_name: params.partName,
        sku: params.sku,
        current_stock: params.currentStock,
        reorder_threshold: params.reorderThreshold,
        unit_of_measure: params.unitOfMeasure,
        category: params.category,
        supplier_name: params.supplierName,
        supplier_email: params.supplierEmail,
        tenant_id: params.tenantId,
      },
    });

    if (error) {
      console.error('Error sending low stock alert:', error);
      throw error;
    }

    console.log('Low stock alert sent successfully:', data);
  } catch (error) {
    console.error('Error in triggerLowStockAlert:', error);
    throw error;
  }
}
