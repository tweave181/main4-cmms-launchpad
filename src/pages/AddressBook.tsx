import React, { useState } from 'react';
import { AddressBookTable } from '@/components/address-book/AddressBookTable';
import { AddressBookFilters, AddressTypeFilters } from '@/components/address-book/AddressBookFilters';

const AddressBook = () => {
  const [filters, setFilters] = useState<AddressTypeFilters>({
    contact: false,
    supplier: false,
    manufacturer: false,
    contractor: false,
    other: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
        <p className="text-muted-foreground">
          View all contact information and company details.
        </p>
      </div>
      
      <AddressBookFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
      
      <AddressBookTable filters={filters} />
    </div>
  );
};

export default AddressBook;