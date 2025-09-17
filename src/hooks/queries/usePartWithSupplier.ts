import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Database } from '@/integrations/supabase/types';

type InventoryPartWithSupplier = Database['public']['Tables']['inventory_parts']['Row'] & {
  supplier?: {
    id: string;
    company_name: string | null;  
    contact_name: string | null;
    address_line_1: string;
  };
};

export const usePartWithSupplier = (partId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['inventory-part-supplier', partId, userProfile?.tenant_id],
    queryFn: async (): Promise<InventoryPartWithSupplier | null> => {
      if (!userProfile?.tenant_id || !partId) {
        return null;
      }

      const { data, error } = await supabase
        .from('inventory_parts')
        .select(`
          *,
          addresses!fk_inventory_parts_supplier (
            id,
            contact_name,
            address_line_1,
            company_details!addresses_company_id_fkey (
              company_name
            )
          )
        `)
        .eq('id', partId)
        .single();

      if (error) {
        console.error('Error fetching part with supplier:', error);
        throw error;
      }

      return {
        ...data,
        supplier: data.addresses ? {
          id: (data.addresses as any).id,
          company_name: (data.addresses as any).company_details?.company_name || null,
          contact_name: (data.addresses as any).contact_name,
          address_line_1: (data.addresses as any).address_line_1,
        } : undefined
      };
    },
    enabled: !!userProfile?.tenant_id && !!partId,
  });
};