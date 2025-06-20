
import React from 'react';
import { Control } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { COMPANY_TYPES } from '@/types/company';
import type { CompanyFormData } from '@/types/company';

interface CompanyTypeFieldsProps {
  control: Control<CompanyFormData>;
}

export const CompanyTypeFields: React.FC<CompanyTypeFieldsProps> = ({
  control,
}) => {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Types *</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COMPANY_TYPES.map((type) => (
              <FormItem key={type} className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(type)}
                    onCheckedChange={(checked) => {
                      const currentTypes = field.value || [];
                      if (checked) {
                        field.onChange([...currentTypes, type]);
                      } else {
                        field.onChange(currentTypes.filter((t) => t !== type));
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal capitalize">
                  {type.replace('_', ' ')}
                </FormLabel>
              </FormItem>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
