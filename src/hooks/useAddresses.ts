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

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('User not authenticated');
      }

      const addressData = {
        ...data,
        tenant_id: userProfile.tenant_id,
      };

      const { data: result, error } = await supabase
        .from('addresses')
        .insert(addressData)
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
      console.error('Create address error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create address",
        variant: "destructive",
      });
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