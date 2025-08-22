import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

type SupplierPart = {
  id: string;
  name: string;
  sku: string;
  quantity_in_stock: number;
  reorder_threshold: number;
};

export const useSupplierParts = (supplierId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['supplier-parts', supplierId, userProfile?.tenant_id],
    queryFn: async (): Promise<SupplierPart[]> => {
      if (!userProfile?.tenant_id || !supplierId) {
        return [];
      }

      const { data, error } = await supabase
        .from('inventory_parts')
        .select(`
          id,
          name,
          sku,
          quantity_in_stock,
          reorder_threshold
        `)
        .eq('supplier_id', supplierId)
        .order('name');

      if (error) {
        console.error('Error fetching supplier parts:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userProfile?.tenant_id && !!supplierId,
  });
};