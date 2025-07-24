
import { toast } from '@/hooks/use-toast';

export interface DropdownOption {
  id: string;
  name: string;
  [key: string]: any;
}

export interface DropdownState {
  data: DropdownOption[];
  isLoading: boolean;
  error: Error | null;
}

export const createEmptyDropdownState = (): DropdownState => ({
  data: [],
  isLoading: false,
  error: null,
});

export const handleDropdownError = (error: any, dropdownName: string): void => {
  console.error(`Error loading ${dropdownName}:`, {
    error,
    message: error?.message,
    stack: error?.stack,
  });
  
  toast({
    title: `Error Loading ${dropdownName}`,
    description: `Failed to load ${dropdownName.toLowerCase()}. Some options may not be available.`,
    variant: "destructive",
  });
};

export const getSafeDropdownValue = (value: any): string => {
  if (!value || value === '') return 'none';
  return String(value);
};

export const getDropdownDisplayValue = (value: any, placeholder: string): string => {
  if (!value || value === '' || value === 'none') return placeholder;
  return String(value);
};

export const normalizeDropdownData = (data: any[]): DropdownOption[] => {
  if (!Array.isArray(data)) {
    console.warn('Dropdown data is not an array:', data);
    return [];
  }
  
  return data.map((item) => ({
    id: item.id || item.value || '',
    name: item.name || item.title || item.label || item.id || '',
    ...item,
  }));
};
