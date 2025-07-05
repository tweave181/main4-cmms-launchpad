import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MapPin, Plus } from 'lucide-react';
import { AddressForm } from './AddressForm';
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import type { Address, AddressFormData } from '@/types/address';

const addressSchema = z.object({
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional(),
  address_line_3: z.string().optional(),
  town_or_city: z.string().optional(),
  county_or_state: z.string().optional(),
  postcode: z.string().optional(),
});

interface AddressFormModalProps {
  address?: Address | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  address,
  isOpen,
  onClose,
}) => {
  const isEditing = !!address;
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line_1: address?.address_line_1 || '',
      address_line_2: address?.address_line_2 || '',
      address_line_3: address?.address_line_3 || '',
      town_or_city: address?.town_or_city || '',
      county_or_state: address?.county_or_state || '',
      postcode: address?.postcode || '',
    },
  });

  React.useEffect(() => {
    if (address) {
      form.reset({
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || '',
        address_line_3: address.address_line_3 || '',
        town_or_city: address.town_or_city || '',
        county_or_state: address.county_or_state || '',
        postcode: address.postcode || '',
      });
    } else {
      form.reset({
        address_line_1: '',
        address_line_2: '',
        address_line_3: '',
        town_or_city: '',
        county_or_state: '',
        postcode: '',
      });
    }
  }, [address, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && address) {
        await updateAddressMutation.mutateAsync({
          id: address.id,
          data,
        });
      } else {
        await createAddressMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditing ? (
              <MapPin className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            <span>{isEditing ? 'Edit Address' : 'Add New Address'}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddressForm control={form.control} />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
              >
                {createAddressMutation.isPending || updateAddressMutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Address'
                  : 'Create Address'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};