import React, { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Edit, Save, X, Trash2 } from 'lucide-react';
import { AddressFormFields } from './AddressFormFields';
import { useAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/auth';
import type { Address, AddressFormData } from '@/types/address';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const addressSchema = z.object({
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional(),
  address_line_3: z.string().optional(),
  town_or_city: z.string().optional(),
  county_or_state: z.string().optional(),
  postcode: z.string().optional(),
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

interface AddressViewEditModalProps {
  addressId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddressViewEditModal: React.FC<AddressViewEditModalProps> = ({
  addressId,
  isOpen,
  onClose,
}) => {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Always call hooks - the hook will handle null/empty IDs gracefully
  const { data: address, isLoading, error } = useAddress(addressId || '');
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line_1: '',
      address_line_2: '',
      address_line_3: '',
      town_or_city: '',
      county_or_state: '',
      postcode: '',
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
    },
  });

  // Reset form when address loads
  useEffect(() => {
    if (address) {
      form.reset({
        address_line_1: address.address_line_1 || '',
        address_line_2: address.address_line_2 || '',
        address_line_3: address.address_line_3 || '',
        town_or_city: address.town_or_city || '',
        county_or_state: address.county_or_state || '',
        postcode: address.postcode || '',
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
    }
  }, [address, form]);

  // Reset edit mode when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
    }
  }, [isOpen]);

  const onSubmit = async (data: AddressFormData) => {
    if (!address) return;
    
    try {
      await updateAddressMutation.mutateAsync({
        id: address.id,
        data,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    
    try {
      await deleteAddressMutation.mutateAsync(address.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const getAddressTitle = () => {
    if (!address) return 'Address Details';
    
    if (address.company_name) {
      return address.company_name;
    }
    
    return address.address_line_1 || 'Address Details';
  };

  // Don't render if no addressId or if there was an error
  if (!addressId) return null;
  
  // Show loading state while address is being fetched
  if (isLoading && !address) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Loading Address...</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Show error state if failed to load address
  if (error && !address) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Error Loading Address</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-destructive">
            Error loading address: {error.message || 'Unknown error'}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{getAddressTitle()}</span>
              </div>
              
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  {!isEditMode && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center space-x-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </>
                  )}
                  
                  {isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(false)}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {address && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AddressFormFields 
                  control={form.control} 
                  disabled={!isEditMode || !isAdmin}
                />
                
                {/* Record Information */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span>
                      <div>{new Date(address.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>
                      <div>{new Date(address.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {isEditMode && isAdmin && (
                  <div className="flex justify-start space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateAddressMutation.isPending}
                      className="flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {updateAddressMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </span>
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this address record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAddressMutation.isPending}
            >
              {deleteAddressMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};