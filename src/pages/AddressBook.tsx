import React, { useState } from 'react';
import { AddressBookTable } from '@/components/address-book/AddressBookTable';
import { AddressBookFilters, AddressTypeFilters } from '@/components/address-book/AddressBookFilters';
import { AddressDetailTabs } from '@/components/addresses/AddressDetailTabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import type { Address } from '@/types/address';

const AddressBook = () => {
  const [filters, setFilters] = useState<AddressTypeFilters>({
    contact: false,
    supplier: false,
    manufacturer: false,
    contractor: false,
    other: false,
  });
  const [search, setSearch] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Address Book List</span>
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            View all contact information and company details.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by company, address, town, or postcode…" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-10" 
              />
            </div>
            
            <AddressBookFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          </div>

          <div className="h-[70vh] min-h-[500px]">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="h-full pr-2">
                  <AddressBookTable 
                    filters={filters} 
                    search={search} 
                    onSelectAddress={setSelectedAddress}
                    selectedAddress={selectedAddress}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full pl-2">
                  {selectedAddress ? (
                    <AddressDetailTabs address={selectedAddress} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select an address to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressBook;