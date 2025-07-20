import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Address, AddressFormData } from '@/types/address';

export const useAddresses = (search?: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['addresses', userProfile?.tenant_id, search],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      let query = supabase
        .from('addresses')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('address_line_1');

      if (search && search.trim()) {
        query = query.or(`address_line_1.ilike.%${search}%,town_or_city.ilike.%${search}%,postcode.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching addresses:', error);
        throw error;
      }

      return data as Address[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCheckAddressDuplicates = () => {
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('User not authenticated');
      }

      const { data: duplicates, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .ilike('address_line_1', data.address_line_1)
        .filter('town_or_city', 'ilike', data.town_or_city || '')
        .filter('postcode', 'ilike', data.postcode || '');

      if (error) {
        console.error('Error checking duplicates:', error);
        throw error;
      }

      return duplicates as Address[];
    },
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: AddressFormData & { ignoreDuplicates?: boolean }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('User not authenticated');
      }

      // Check for duplicates unless explicitly ignored
      if (!data.ignoreDuplicates) {
        const { data: duplicates, error: duplicateError } = await supabase
          .from('addresses')
          .select('*')
          .eq('tenant_id', userProfile.tenant_id)
          .ilike('address_line_1', data.address_line_1);

        if (duplicateError) {
          console.error('Error checking duplicates:', duplicateError);
        } else if (duplicates && duplicates.length > 0) {
          // Filter for exact matches on key fields (case-insensitive)
          const exactDuplicates = duplicates.filter(addr => 
            addr.address_line_1.toLowerCase() === data.address_line_1.toLowerCase() &&
            (addr.town_or_city || '').toLowerCase() === (data.town_or_city || '').toLowerCase() &&
            (addr.postcode || '').toLowerCase() === (data.postcode || '').toLowerCase()
          );

          if (exactDuplicates.length > 0) {
            const duplicate = exactDuplicates[0];
            const addressPreview = [
              duplicate.address_line_1,
              duplicate.town_or_city,
              duplicate.postcode
            ].filter(Boolean).join(', ');
            
            throw new Error(`DUPLICATE_ADDRESS:${JSON.stringify({ duplicate, addressPreview })}`);
          }
        }
      }

      const { ignoreDuplicates, ...addressData } = data;
      const finalData = {
        ...addressData,
        tenant_id: userProfile.tenant_id,
        // Ensure boolean fields have default values
        is_contact: addressData.is_contact || false,
        is_supplier: addressData.is_supplier || false,
        is_manufacturer: addressData.is_manufacturer || false,
        is_contractor: addressData.is_contractor || false,
        is_other: addressData.is_other || false,
      };

      const { data: result, error } = await supabase
        .from('addresses')
        .insert(finalData)
        .select()
        .single();

      if (error) {
        console.error('Error creating address:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Success",
        description: "Address created successfully",
      });
    },
    onError: (error: any) => {
      // Don't show toast for duplicate errors - let the component handle it
      if (!error.message?.startsWith('DUPLICATE_ADDRESS:')) {
        console.error('Create address error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create address",
          variant: "destructive",
        });
      }
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddressFormData> }) => {
      const { data: result, error } = await supabase
        .from('addresses')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating address:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update address error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete address error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    },
  });
};

export const useAddress = (id: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', userProfile.tenant_id)
        .single();

      if (error) {
        console.error('Error fetching address:', error);
        throw error;
      }

      return data as Address;
    },
    enabled: !!userProfile?.tenant_id && !!id,
  });
};