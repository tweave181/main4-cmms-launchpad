
import React, { useState, useEffect } from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, HelpCircle, Wand2 } from 'lucide-react';
import { AssetPrefixFormData } from './useAssetPrefixForm';
import { useAutoSuggest } from './hooks/useAutoSuggest';
import { CategorySelector } from './CategorySelector';

interface AssetPrefixBasicFieldsProps {
  control: Control<AssetPrefixFormData>;
  isPrefixInUse?: boolean;
  isDuplicate?: boolean;
  form: any; // React Hook Form instance
}

export const AssetPrefixBasicFields: React.FC<AssetPrefixBasicFieldsProps> = ({
  control,
  isPrefixInUse = false,
  isDuplicate = false,
  form,
}) => {
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(false);
  
  // Watch the prefix letter for auto-suggest
  const prefixLetter = form.watch('prefix_letter');
  
  // Get auto-suggested number
  const { data: suggestedNumber, isLoading: isLoadingSuggestion } = useAutoSuggest({
    prefixLetter: prefixLetter || '',
    enabled: autoSuggestEnabled,
  });

  // Auto-fill the number code when suggestion is available
  useEffect(() => {
    if (autoSuggestEnabled && suggestedNumber && prefixLetter) {
      form.setValue('number_code', suggestedNumber.toString());
    }
  }, [autoSuggestEnabled, suggestedNumber, prefixLetter, form]);

  // Clear number code when auto-suggest is disabled
  const handleAutoSuggestToggle = (checked: boolean) => {
    setAutoSuggestEnabled(checked);
    if (!checked) {
      form.setValue('number_code', '');
    }
  };

  // Get current form values for preview
  const formValues = form.watch();
  const previewPrefix = formValues.prefix_letter || 'X';
  const previewNumber = (parseInt(formValues.number_code || '0') || 0).toString();

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
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    field.onChange(value);
                    // Reset auto-suggest when prefix letter changes
                    if (autoSuggestEnabled) {
                      form.setValue('number_code', '');
                    }
                  }}
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
                  placeholder={autoSuggestEnabled && isLoadingSuggestion ? "Loading..." : "1"}
                  maxLength={3}
                  onChange={(e) => {
                    if (!autoSuggestEnabled) {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 999)) {
                        field.onChange(value);
                      }
                    }
                  }}
                  disabled={isPrefixInUse || autoSuggestEnabled}
                  className={isDuplicate ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
              {isDuplicate && (
                <p className="text-sm text-red-600 mt-1">
                  This prefix letter and number combination already exists
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* Auto-suggest toggle */}
      {!isPrefixInUse && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox
            id="auto-suggest"
            checked={autoSuggestEnabled}
            onCheckedChange={handleAutoSuggestToggle}
          />
          <label
            htmlFor="auto-suggest"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
          >
            <Wand2 className="h-4 w-4 text-blue-600" />
            Auto-suggest next available number
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-blue-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Automatically suggests the next available number for the selected prefix letter</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Category Selection */}
      <CategorySelector 
        control={control}
        name="category_id"
        disabled={isPrefixInUse}
      />

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
          {previewPrefix}{previewNumber}/001
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example asset tag format
        </p>
      </div>
    </TooltipProvider>
  );
};
