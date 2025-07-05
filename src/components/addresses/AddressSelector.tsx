import React, { useState } from 'react';
import { Control } from 'react-hook-form';
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
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AddressForm } from './AddressForm';
import { AddressDisplay } from './AddressDisplay';
import { useAddresses } from '@/hooks/useAddresses';
import type { Address } from '@/types/address';

interface AddressSelectorProps {
  control: Control<any>;
  addressFieldName?: string;
  addressIdFieldName?: string;
  label?: string;
  placeholder?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  control,
  addressFieldName = 'address',
  addressIdFieldName = 'company_address_id',
  label = 'Address',
  placeholder = 'Select address',
}) => {
  const [useExisting, setUseExisting] = useState(true);
  const { data: addresses = [], isLoading } = useAddresses();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Create New</span>
          <Switch
            checked={useExisting}
            onCheckedChange={setUseExisting}
          />
          <span className="text-sm">Use Existing</span>
        </div>
      </div>

      {useExisting ? (
        <FormField
          control={control}
          name={addressIdFieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        <div className="text-left">
                          <div className="font-medium">{address.address_line_1}</div>
                          <div className="text-sm text-muted-foreground">
                            {[address.town_or_city, address.postcode].filter(Boolean).join(', ')}
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
      ) : (
        <Card>
          <CardContent className="pt-6">
            <AddressForm control={control} prefix={addressFieldName} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};