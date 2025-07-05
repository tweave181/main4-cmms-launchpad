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
import { useLocations } from '@/hooks/useLocations';

interface LocationSelectorProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  control,
  name,
  label,
  placeholder = "Select location",
  required = false,
}) => {
  const { data: locations = [], isLoading } = useLocations();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && ' *'}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue 
                  placeholder={isLoading ? "Loading locations..." : placeholder} 
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary text-xs bg-primary/10 px-2 py-1 rounded">
                      {location.location_code}
                    </span>
                    <span>{location.name}</span>
                  </div>
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