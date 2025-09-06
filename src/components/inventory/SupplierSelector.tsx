import React, { useState } from 'react';
import { useAddresses } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Building2 } from 'lucide-react';

interface SupplierSelectorProps {
  onSelect: (supplierId: string | null) => void;
  onCancel: () => void;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  onSelect,
  onCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: addresses, isLoading } = useAddresses();

  // Filter addresses to show only suppliers and apply search
  const filteredSuppliers = addresses?.filter(address => {
    const isSupplier = address.is_supplier;
    const matchesSearch = searchTerm === '' || 
      address.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.address_line_1.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isSupplier && matchesSearch;
  }) || [];

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-background">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <ScrollArea className="h-48">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading suppliers...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            {searchTerm ? 'No suppliers match your search' : 'No suppliers found'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => onSelect(supplier.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {supplier.contact_name || 'Contact Name Not Set'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {supplier.address_line_1}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Supplier
                </Badge>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};