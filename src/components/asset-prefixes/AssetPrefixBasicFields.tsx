
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, HelpCircle } from 'lucide-react';
import { AssetPrefixFormData } from './useAssetPrefixForm';

interface AssetPrefixBasicFieldsProps {
  control: Control<AssetPrefixFormData>;
  isPrefixInUse?: boolean;
}

export const AssetPrefixBasicFields: React.FC<AssetPrefixBasicFieldsProps> = ({
  control,
  isPrefixInUse = false,
}) => {
  return (
    <TooltipProvider>
      <div className="flex gap-3">
        <FormField
          control={control}
          name="prefix_letter"
          render={({ field }) => (
            <FormItem className="w-20">
              <FormLabel className="flex items-center gap-2">
                Prefix Letter
                {isPrefixInUse && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className="h-3 w-3 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This prefix is already assigned to one or more assets and cannot be modified.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="E"
                  maxLength={1}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  className="text-center"
                  disabled={isPrefixInUse}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="number_code"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-2">
                Number Code
                {isPrefixInUse && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className="h-3 w-3 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This prefix is already assigned to one or more assets and cannot be modified.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="001"
                  maxLength={3}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value.padStart(3, '0').slice(0, 3));
                  }}
                  disabled={isPrefixInUse}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Chillers"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-blue-800 font-medium">Preview:</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-blue-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Tags are generated as: PrefixLetter + Number (e.g. E3/001). Each prefix can support up to 999 assets.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-lg font-mono font-bold text-blue-900 mt-1">
          {control._formValues.prefix_letter || 'X'}
          {parseInt(control._formValues.number_code || '0') || '0'}/001
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example asset tag format
        </p>
      </div>
    </TooltipProvider>
  );
};
