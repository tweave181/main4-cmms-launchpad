
import { toast } from '@/hooks/use-toast';

export interface DropdownOption {
  id: string;
  name: string;
  [key: string]: string | number | boolean | null | undefined;
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

export const handleDropdownError = (error: unknown, dropdownName: string): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`Error loading ${dropdownName}:`, {
    error,
    message: errorMessage,
    stack: errorStack,
  });
  
  toast({
    title: `Error Loading ${dropdownName}`,
    description: `Failed to load ${dropdownName.toLowerCase()}. Some options may not be available.`,
    variant: "destructive",
  });
};

export const getSafeDropdownValue = (value: string | number | null | undefined): string => {
  if (!value || value === '') return 'none';
  return String(value);
};

export const getDropdownDisplayValue = (value: string | number | null | undefined, placeholder: string): string => {
  if (!value || value === '' || value === 'none') return placeholder;
  return String(value);
};

interface RawDropdownItem {
  id?: string;
  value?: string;
  name?: string;
  title?: string;
  label?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export const normalizeDropdownData = (data: unknown): DropdownOption[] => {
  if (!Array.isArray(data)) {
    console.warn('Dropdown data is not an array:', data);
    return [];
  }
  
  return data.map((item: RawDropdownItem) => ({
    id: item.id || item.value || '',
    name: item.name || item.title || item.label || item.id || '',
    ...item,
  }));
};
