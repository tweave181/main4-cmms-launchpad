import React, { useState } from 'react';
import { Control, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { CreateManufacturerModal } from '@/components/companies/CreateManufacturerModal';
import { useAuth } from '@/contexts/auth';
import type { AssetFormData } from '../types';

interface ManufacturerFieldProps {
  control: Control<AssetFormData>;
}

export const ManufacturerField: React.FC<ManufacturerFieldProps> = ({
  control,
}) => {
  const { userProfile } = useAuth();
  const { data: manufacturers = [] } = useCompanies('manufacturer');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { setValue } = useFormContext<AssetFormData>();
  
  // Check if user has permission to create manufacturers
  const canCreateManufacturer = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  const handleAddNewManufacturer = () => {
    if (canCreateManufacturer) {
      setShowCreateModal(true);
    }
  };


  return (
    <>
      <FormField
        control={control}
        name="manufacturer_company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer</FormLabel>
            <Select 
              onValueChange={(value) => {
                if (value === 'add-new-manufacturer') {
                  handleAddNewManufacturer();
                } else {
                  field.onChange(value === 'no-manufacturer' ? undefined : value);
                }
              }} 
              value={field.value || 'no-manufacturer'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-manufacturer">No Manufacturer</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.company_name}
                  </SelectItem>
                ))}
                {canCreateManufacturer && (
                  <SelectItem value="add-new-manufacturer" className="text-primary font-medium border-t">
                    ➕ Add new manufacturer
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <CreateManufacturerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(manufacturerId) => {
          setValue('manufacturer_company_id', manufacturerId);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};