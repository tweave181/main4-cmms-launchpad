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
        .order('is_primary', { ascending: false })
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

      // If setting as primary, first unset all other primary contacts for this address
      if (contactData.is_primary) {
        await supabase
          .from('address_contacts')
          .update({ is_primary: false })
          .eq('address_id', addressId)
          .eq('tenant_id', userProfile.tenant_id);
      }

      const { data, error } = await supabase
        .from('address_contacts')
        .insert({
          ...contactData,
          address_id: addressId,
          tenant_id: userProfile.tenant_id,
          is_primary: contactData.is_primary || false,
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
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, contactData }: { id: string; contactData: AddressContactFormData }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Get the contact's address_id for primary contact logic
      const { data: currentContact } = await supabase
        .from('address_contacts')
        .select('address_id')
        .eq('id', id)
        .single();

      if (!currentContact) {
        throw new Error('Contact not found');
      }

      // If setting as primary, first unset all other primary contacts for this address
      if (contactData.is_primary) {
        await supabase
          .from('address_contacts')
          .update({ is_primary: false })
          .eq('address_id', currentContact.address_id)
          .eq('tenant_id', userProfile.tenant_id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('address_contacts')
        .update({
          ...contactData,
          is_primary: contactData.is_primary || false,
        })
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

export const useSetPrimaryContact = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ contactId, addressId }: { contactId: string; addressId: string }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // First unset all primary contacts for this address
      await supabase
        .from('address_contacts')
        .update({ is_primary: false })
        .eq('address_id', addressId)
        .eq('tenant_id', userProfile.tenant_id);

      // Then set this contact as primary
      const { data, error } = await supabase
        .from('address_contacts')
        .update({ is_primary: true })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error setting primary contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['address-contacts', data.address_id] });
    },
  });
};