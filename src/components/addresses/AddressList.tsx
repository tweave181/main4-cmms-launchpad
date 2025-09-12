import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import type { Address } from '@/types/address';
interface AddressListProps {
  onAddAddress: () => void;
}
export const AddressList: React.FC<AddressListProps> = ({
  onAddAddress
}) => {
  const navigate = useNavigate();
  const {
    formatDate
  } = useGlobalSettings();
  const [search, setSearch] = useState('');
  const {
    data: addresses = [],
    isLoading
  } = useAddresses(search);
  const handleRowClick = (address: Address) => {
    navigate(`/addresses/${address.id}`);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search by company, address line 1, town, or postcode…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={onAddAddress} className="rounded-2xl">
            Add Address
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-300">Company</TableHead>
                <TableHead className="bg-gray-300">Contact</TableHead>
                <TableHead className="bg-gray-300">Address</TableHead>
                <TableHead className="bg-gray-300">Town/City</TableHead>
                <TableHead className="bg-gray-300">Postcode</TableHead>
                <TableHead className="bg-gray-300">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {addresses.length === 0 ? <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? 'No addresses found matching your search.' : 'No addresses found. Create your first address to get started.'}
                  </TableCell>
                </TableRow> : addresses.map(address => <TableRow 
                  key={address.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(address)}
                >
                    <TableCell>
                      <div className="font-medium">{address.company_details?.company_name || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{address.contact_name || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{address.address_line_1}</div>
                      {address.address_line_2 && <div className="text-sm text-muted-foreground">{address.address_line_2}</div>}
                    </TableCell>
                    <TableCell>{address.town_or_city || '-'}</TableCell>
                    <TableCell>{address.postcode || '-'}</TableCell>
                    <TableCell>{formatDate(address.created_at)}</TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </div>
    </>;
};