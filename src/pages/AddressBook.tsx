import React from 'react';
import { AddressBookTable } from '@/components/address-book/AddressBookTable';

const AddressBook = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
        <p className="text-muted-foreground">
          View all contact information and company details.
        </p>
      </div>
      
      <AddressBookTable />
    </div>
  );
};

export default AddressBook;