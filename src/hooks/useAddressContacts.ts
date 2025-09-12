import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { AddressContact, AddressContactFormData } from '@/types/addressContact';

export const useAddressContacts = (addressId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['address-contacts', addressId],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('address_contacts')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('address_id', addressId)
        .order('name');

      if (error) {
        console.error('Error fetching address contacts:', error);
        throw error;
      }

      return data as AddressContact[];
    },
    enabled: !!userProfile?.tenant_id && !!addressId,
  });
};

export const useCreateAddressContact = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ addressId, contactData }: { addressId: string; contactData: AddressContactFormData }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('address_contacts')
        .insert({
          ...contactData,
          address_id: addressId,
          tenant_id: userProfile.tenant_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating address contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['address-contacts', data.address_id] });
    },
  });
};

export const useUpdateAddressContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, contactData }: { id: string; contactData: AddressContactFormData }) => {
      const { data, error } = await supabase
        .from('address_contacts')
        .update(contactData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating address contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['address-contacts', data.address_id] });
    },
  });
};

export const useDeleteAddressContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('address_contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting address contact:', error);
        throw error;
      }

      return id;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['address-contacts'] });
    },
  });
};