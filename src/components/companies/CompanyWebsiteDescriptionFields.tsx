import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { CompanyFormData } from '@/types/company';

interface CompanyWebsiteDescriptionFieldsProps {
  control: Control<CompanyFormData>;
}

const normalizeUrl = (value: string): string => {
  if (!value) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const CompanyWebsiteDescriptionFields: React.FC<CompanyWebsiteDescriptionFieldsProps> = ({
  control,
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="company_website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Website</FormLabel>
            <FormControl>
              <Input 
                type="url"
                placeholder="https://example.com"
                {...field}
                onBlur={(e) => {
                  const normalized = normalizeUrl(e.target.value);
                  field.onChange(normalized);
                  field.onBlur();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="company_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Description</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Textarea 
                  placeholder="Enter company description..."
                  className="min-h-[100px] resize-y"
                  {...field}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0} / 4,000
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};