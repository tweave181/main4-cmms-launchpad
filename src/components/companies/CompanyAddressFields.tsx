import React from 'react';
import { Control } from 'react-hook-form';
import { AddressSelector } from '@/components/addresses/AddressSelector';
import type { CompanyFormData } from '@/types/company';

interface CompanyAddressFieldsProps {
  control: Control<CompanyFormData>;
}

export const CompanyAddressFields: React.FC<CompanyAddressFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <AddressSelector
        control={control}
        addressFieldName="company_address"
        addressIdFieldName="company_address_id"
        label="Company Address"
        placeholder="Select company address"
      />
    </div>
  );
};