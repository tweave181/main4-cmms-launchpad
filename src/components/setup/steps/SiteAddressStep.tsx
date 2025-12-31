import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProgramSettingsFormData } from '@/hooks/useProgramSettings';

interface SiteAddressStepProps {
  form: UseFormReturn<ProgramSettingsFormData>;
}

export const SiteAddressStep: React.FC<SiteAddressStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Site Address</h3>
        <p className="text-sm text-muted-foreground">
          Enter your organization's physical address
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="site_address_line_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1 *</FormLabel>
              <FormControl>
                <Input placeholder="Street address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_address_line_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Apartment, suite, etc. (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_address_line_3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 3</FormLabel>
              <FormControl>
                <Input placeholder="Additional address info (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="site_town_or_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town / City *</FormLabel>
                <FormControl>
                  <Input placeholder="Town or city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="site_county_or_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County / State</FormLabel>
                <FormControl>
                  <Input placeholder="County or state" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="site_postcode"
          render={({ field }) => (
            <FormItem className="max-w-[200px]">
              <FormLabel>Postcode *</FormLabel>
              <FormControl>
                <Input placeholder="Postcode" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
