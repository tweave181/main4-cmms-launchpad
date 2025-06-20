
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { CompanyFormData } from '@/types/company';

interface CompanyBasicFieldsProps {
  control: Control<CompanyFormData>;
}

export const CompanyBasicFields: React.FC<CompanyBasicFieldsProps> = ({
  control,
}) => {
  return (
    <FormField
      control={control}
      name="company_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name *</FormLabel>
          <FormControl>
            <Input placeholder="Enter company name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
