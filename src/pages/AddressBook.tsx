import React, { useState } from 'react';
import { AddressBookTable } from '@/components/address-book/AddressBookTable';
import { AddressBookFilters, AddressTypeFilters } from '@/components/address-book/AddressBookFilters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
        <p className="text-muted-foreground">
          View all contact information and company details.
        </p>
      </div>
      
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
      
      <AddressBookTable filters={filters} search={search} />
    </div>
  );
};

export default AddressBook;