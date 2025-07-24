
import React from 'react';
import { Control } from 'react-hook-form';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSafeDropdownValue, getDropdownDisplayValue, type DropdownOption } from './utils/dropdownHelpers';

interface SafeDropdownFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  options: DropdownOption[];
  isLoading?: boolean;
  error?: Error | null;
  required?: boolean;
  onValueChange?: (value: string) => void;
}

export const SafeDropdownField: React.FC<SafeDropdownFieldProps> = ({
  control,
  name,
  label,
  placeholder,
  options,
  isLoading = false,
  error = null,
  required = false,
  onValueChange,
}) => {
  const handleValueChange = (value: string, fieldOnChange: (value: any) => void) => {
    const safeValue = value === 'none' ? '' : value;
    fieldOnChange(safeValue);
    onValueChange?.(safeValue);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          
          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load options. Please refresh the page.
              </AlertDescription>
            </Alert>
          )}
          
          <Select 
            onValueChange={(value) => handleValueChange(value, field.onChange)}
            value={getSafeDropdownValue(field.value)}
            disabled={isLoading || !!error}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">
                {getDropdownDisplayValue('', placeholder)}
              </SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
