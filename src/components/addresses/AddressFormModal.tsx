
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MapPin, Plus, AlertTriangle, Check } from 'lucide-react';
import { AddressFormFields } from './AddressFormFields';
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import { useFormDialog } from '@/hooks/useFormDialog';
import type { Address, AddressFormData } from '@/types/address';

const addressSchema = z.object({
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional(),
  address_line_3: z.string().optional(),
  town_or_city: z.string().optional(),
  county_or_state: z.string().optional(),
  postcode: z.string().optional(),
  company_id: z.string().nullable().optional(),
  company_name: z.string().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().optional(),
  notes: z.string().optional(),
  is_contact: z.boolean().optional(),
  is_supplier: z.boolean().optional(),
  is_manufacturer: z.boolean().optional(),
  is_contractor: z.boolean().optional(),
  is_other: z.boolean().optional(),
});

interface AddressFormModalProps {
  address?: Address | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address: Address) => void;
}

interface DuplicateInfo {
  duplicate: Address;
  addressPreview: string;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  address,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!address;
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [showOverrideOption, setShowOverrideOption] = useState(false);

  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose,
  });

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line_1: address?.address_line_1 || '',
      address_line_2: address?.address_line_2 || '',
      address_line_3: address?.address_line_3 || '',
      town_or_city: address?.town_or_city || '',
      county_or_state: address?.county_or_state || '',
      postcode: address?.postcode || '',
      company_id: address?.company_id || null,
      company_name: address?.company_name || '',
      contact_name: address?.contact_name || '',
      phone: address?.phone || '',
      email: address?.email || '',
      website: address?.website || '',
      notes: address?.notes || '',
      is_contact: address?.is_contact || false,
      is_supplier: address?.is_supplier || false,
      is_manufacturer: address?.is_manufacturer || false,
      is_contractor: address?.is_contractor || false,
      is_other: address?.is_other || false,
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
        company_id: address.company_id || null,
        company_name: address.company_name || '',
        contact_name: address.contact_name || '',
        phone: address.phone || '',
        email: address.email || '',
        website: address.website || '',
        notes: address.notes || '',
        is_contact: address.is_contact || false,
        is_supplier: address.is_supplier || false,
        is_manufacturer: address.is_manufacturer || false,
        is_contractor: address.is_contractor || false,
        is_other: address.is_other || false,
      });
    } else {
      form.reset({
        address_line_1: '',
        address_line_2: '',
        address_line_3: '',
        town_or_city: '',
        county_or_state: '',
        postcode: '',
        company_id: null,
        company_name: '',
        contact_name: '',
        phone: '',
        email: '',
        website: '',
        notes: '',
        is_contact: false,
        is_supplier: false,
        is_manufacturer: false,
        is_contractor: false,
        is_other: false,
      });
    }
    // Reset duplicate detection state when address changes
    setDuplicateInfo(null);
    setShowOverrideOption(false);
  }, [address, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && address) {
        const updatedAddress = await updateAddressMutation.mutateAsync({
          id: address.id,
          data,
        });
        onSuccess?.(updatedAddress);
        onClose();
      } else {
        const newAddress = await createAddressMutation.mutateAsync(data);
        onSuccess?.(newAddress);
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      
      // Handle duplicate address error
      if (error.message?.startsWith('DUPLICATE_ADDRESS:')) {
        const duplicateData = JSON.parse(error.message.replace('DUPLICATE_ADDRESS:', ''));
        setDuplicateInfo(duplicateData);
        setShowOverrideOption(true);
      }
    }
  };

  const handleOverrideDuplicate = async () => {
    const data = form.getValues();
    try {
      const newAddress = await createAddressMutation.mutateAsync({ ...data, ignoreDuplicates: true });
      onSuccess?.(newAddress);
      onClose();
    } catch (error) {
      console.error('Error overriding duplicate:', error);
    }
  };

  const handleUseDuplicate = () => {
    // Use the existing duplicate address
    onSuccess?.(duplicateInfo!.duplicate);
    onClose();
  };

  return (
    <>
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <FormDialogHeader>
            <FormDialogTitle className="flex items-center space-x-2">
              {isEditing ? (
                <MapPin className="h-5 w-5 text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
              <span>{isEditing ? 'Edit Address' : 'Add New Address'}</span>
            </FormDialogTitle>
          </FormDialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AddressFormFields control={form.control} />

              {duplicateInfo && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-2">
                      <p className="font-medium">This address already exists in the system:</p>
                      <p className="text-sm bg-white px-2 py-1 rounded border">
                        {duplicateInfo.addressPreview}
                      </p>
                      <p className="text-sm">
                        Please use the existing record or adjust the details.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-start space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                
                {showOverrideOption && duplicateInfo && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseDuplicate}
                      className="flex items-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Use Existing</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleOverrideDuplicate}
                      disabled={createAddressMutation.isPending}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Anyway</span>
                    </Button>
                  </>
                )}
                
                {!showOverrideOption && (
                  <Button
                    type="submit"
                    disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  >
                    {(createAddressMutation.isPending || updateAddressMutation.isPending)
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Address'
                      : 'Create Address'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </FormDialogContent>
      </FormDialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleGoBack}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
};
