import React, { useMemo, useState } from 'react';
import { useAddresses } from '@/hooks/useAddresses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressTypeBadges } from './AddressTypeBadges';
import { AddressDetailModal } from './AddressDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Address } from '@/types/address';
import { AddressTypeFilters } from './AddressBookFilters';
interface AddressBookTableProps {
  filters: AddressTypeFilters;
  search?: string;
}
export const AddressBookTable = ({
  filters,
  search
}: AddressBookTableProps) => {
  const {
    data: addresses,
    isLoading,
    error
  } = useAddresses(search);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredAddresses = useMemo(() => {
    if (!addresses) return [];
    const hasActiveFilters = Object.values(filters).some(value => value);
    if (!hasActiveFilters) return addresses;
    return addresses.filter((address: Address) => {
      if (filters.contact && address.is_contact) return true;
      if (filters.supplier && address.is_supplier) return true;
      if (filters.manufacturer && address.is_manufacturer) return true;
      if (filters.contractor && address.is_contractor) return true;
      if (filters.other && address.is_other) return true;
      return false;
    });
  }, [addresses, filters]);
  const handleRowClick = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
  };
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle>Address Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card>
        <CardHeader>
          <CardTitle>Address Book</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading addresses: {error.message}</p>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle>Address Book</CardTitle>
      </CardHeader>
      <CardContent>
        {!filteredAddresses || filteredAddresses.length === 0 ? <p className="text-muted-foreground text-center py-8">
            {!addresses || addresses.length === 0 ? "No addresses found in the directory." : "No addresses match the selected filters."}
          </p> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-300">Company</TableHead>
                <TableHead className="bg-gray-300">Contact</TableHead>
                <TableHead className="bg-gray-300">Address</TableHead>
                <TableHead className="bg-gray-300">Town/City</TableHead>
                <TableHead className="bg-gray-300">Postcode</TableHead>
                <TableHead className="bg-gray-300">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAddresses.map(address => <TableRow key={address.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleRowClick(address)}>
                  <TableCell>
                    <div className="font-medium">{address.company?.company_name || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{address.contact_name || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{address.address_line_1}</div>
                      {address.address_line_2 && <div className="text-sm text-muted-foreground">{address.address_line_2}</div>}
                      {address.address_line_3 && <div className="text-sm text-muted-foreground">{address.address_line_3}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{address.town_or_city || '-'}</TableCell>
                  <TableCell>{address.postcode || '-'}</TableCell>
                  <TableCell>
                    <AddressTypeBadges address={address} />
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>}
        
        <AddressDetailModal address={selectedAddress} isOpen={isModalOpen} onClose={handleCloseModal} />
      </CardContent>
    </Card>;
};