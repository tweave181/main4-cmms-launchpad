import React, { useState } from 'react';
import { Control, useWatch, useController } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { AddressCard } from '@/components/ui/address-card';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { useAddresses } from '@/hooks/useAddresses';
import type { CompanyFormData } from '@/types/company';

interface CompanyAddressFieldsProps {
  control: Control<CompanyFormData>;
}

export const CompanyAddressFields: React.FC<CompanyAddressFieldsProps> = ({ control }) => {
  const [useExisting, setUseExisting] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const { data: addresses = [], isLoading } = useAddresses();
  
  const { field: addressIdField } = useController({
    control,
    name: 'company_address_id'
  });
  
  const selectedAddressId = useWatch({
    control,
    name: 'company_address_id'
  });

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const handleNewAddressSuccess = (newAddress: any) => {
    // Set the new address ID in the form and close the modal
    addressIdField.onChange(newAddress.id);
    setShowAddressModal(false);
    setUseExisting(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Company Address (Optional)</FormLabel>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Create New</span>
          <Switch
            checked={useExisting}
            onCheckedChange={(checked) => {
              setUseExisting(checked);
              if (!checked) {
                setShowAddressModal(true);
              }
            }}
          />
          <span className="text-sm">Use Existing</span>
        </div>
      </div>

      {useExisting && (
        <FormField
          control={control}
          name="company_address_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value || null)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company address (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground">No address</span>
                    </SelectItem>
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        <div className="text-left">
                          <div className="font-medium">{address.company_name || address.address_line_1}</div>
                          <div className="text-sm text-muted-foreground">
                            {[address.address_line_1, address.town_or_city, address.postcode].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {selectedAddress ? (
        <div className="mt-4">
          <AddressCard
            companyName={selectedAddress.company_name}
            address={{
              line1: selectedAddress.address_line_1,
              line2: selectedAddress.address_line_2,
              line3: selectedAddress.address_line_3,
              town_city: selectedAddress.town_or_city,
              county_state: selectedAddress.county_or_state,
              postcode: selectedAddress.postcode,
            }}
          />
        </div>
      ) : (
        <div className="mt-4 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          <p className="text-sm">No address selected</p>
          <p className="text-xs">You can add an address later if needed</p>
        </div>
      )}

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setUseExisting(true);
        }}
        onSuccess={handleNewAddressSuccess}
      />
    </div>
  );
};