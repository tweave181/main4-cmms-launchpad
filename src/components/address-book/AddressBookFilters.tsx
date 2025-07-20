import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AddressTypeFilters {
  contact: boolean;
  supplier: boolean;
  manufacturer: boolean;
  contractor: boolean;
  other: boolean;
}

interface AddressBookFiltersProps {
  filters: AddressTypeFilters;
  onFiltersChange: (filters: AddressTypeFilters) => void;
}

export const AddressBookFilters = ({ filters, onFiltersChange }: AddressBookFiltersProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = (filterType: keyof AddressTypeFilters, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [filterType]: checked,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      contact: false,
      supplier: false,
      manufacturer: false,
      contractor: false,
      other: false,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Type
                {hasActiveFilters && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({Object.values(filters).filter(Boolean).length} active)
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact"
                    checked={filters.contact}
                    onCheckedChange={(checked) => handleFilterChange('contact', !!checked)}
                  />
                  <Label htmlFor="contact" className="text-sm font-medium">
                    Contact
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supplier"
                    checked={filters.supplier}
                    onCheckedChange={(checked) => handleFilterChange('supplier', !!checked)}
                  />
                  <Label htmlFor="supplier" className="text-sm font-medium">
                    Supplier
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manufacturer"
                    checked={filters.manufacturer}
                    onCheckedChange={(checked) => handleFilterChange('manufacturer', !!checked)}
                  />
                  <Label htmlFor="manufacturer" className="text-sm font-medium">
                    Manufacturer
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contractor"
                    checked={filters.contractor}
                    onCheckedChange={(checked) => handleFilterChange('contractor', !!checked)}
                  />
                  <Label htmlFor="contractor" className="text-sm font-medium">
                    Contractor
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="other"
                    checked={filters.other}
                    onCheckedChange={(checked) => handleFilterChange('other', !!checked)}
                  />
                  <Label htmlFor="other" className="text-sm font-medium">
                    Other
                  </Label>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};