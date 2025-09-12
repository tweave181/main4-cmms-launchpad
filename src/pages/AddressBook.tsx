import React, { useState } from 'react';
import { AddressBookTable } from '@/components/address-book/AddressBookTable';
import { AddressBookFilters, AddressTypeFilters } from '@/components/address-book/AddressBookFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

const AddressBook = () => {
  const [filters, setFilters] = useState<AddressTypeFilters>({
    contact: false,
    supplier: false,
    manufacturer: false,
    contractor: false,
    other: false,
  });
  const [search, setSearch] = useState('');

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

          <AddressBookTable 
            filters={filters} 
            search={search} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressBook;