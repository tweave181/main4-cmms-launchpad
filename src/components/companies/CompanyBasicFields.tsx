
import React from 'react';
import { Control, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCompanyDuplicateCheck } from '@/hooks/useCompanyDuplicateCheck';
import type { CompanyFormData } from '@/types/company';

interface CompanyBasicFieldsProps {
  control: Control<CompanyFormData>;
  companyId?: string;
}

export const CompanyBasicFields: React.FC<CompanyBasicFieldsProps> = ({
  control,
  companyId,
}) => {
  const { checkCompanyNameExists } = useCompanyDuplicateCheck();
  const { setError, clearErrors } = useFormContext<CompanyFormData>();

  const handleBlur = async (value: string) => {
    if (!value?.trim()) return;

    const result = await checkCompanyNameExists(value, companyId);
    if (result.exists && result.message) {
      setError('company_name', {
        type: 'manual',
        message: result.message
      });
    } else {
      clearErrors('company_name');
    }
  };

  return (
    <FormField
      control={control}
      name="company_name"
      rules={{
        validate: async (value: string) => {
          if (!value?.trim()) return 'Company name is required';
          
          const result = await checkCompanyNameExists(value, companyId);
          return result.exists ? result.message : true;
        }
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter company name"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              {...field}
              onBlur={(e) => {
                field.onBlur();
                handleBlur(e.target.value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
