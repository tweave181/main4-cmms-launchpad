import React, { useState, useEffect } from 'react';
import { Control, useController } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { useDebounce } from '@/hooks/useDebounce';
import type { AddressFormData } from '@/types/address';
import type { CompanyDetails } from '@/types/company';

interface CompanySelectorProps {
  control: Control<AddressFormData>;
  disabled?: boolean;
  onCompanySelect?: (company: CompanyDetails | null) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  control,
  disabled = false,
  onCompanySelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data: companies = [], isLoading } = useCompanies();
  
  const { field: companyIdField } = useController({
    control,
    name: 'company_id'
  });

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === companyIdField.value);

  const handleCompanyChange = (value: string) => {
    if (value === 'no-company') {
      companyIdField.onChange(null);
      onCompanySelect?.(null);
    } else {
      const company = companies.find(c => c.id === value);
      companyIdField.onChange(value);
      onCompanySelect?.(company || null);
    }
    setSearchTerm('');
  };

  return (
    <FormField
      control={control}
      name="company_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Company</FormLabel>
          <FormControl>
            <Select
              value={field.value || 'no-company'}
              onValueChange={handleCompanyChange}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-company">
                  <span className="text-muted-foreground">No company selected</span>
                </SelectItem>
                {filteredCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="text-left">
                      <div className="font-medium">{company.company_name}</div>
                      {company.contact_name && (
                        <div className="text-sm text-muted-foreground">
                          Contact: {company.contact_name}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
          {selectedCompany && (
            <p className="text-xs text-muted-foreground mt-1">
              Changing company will refresh site details below.
            </p>
          )}
        </FormItem>
      )}
    />
  );
};