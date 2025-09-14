import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddresses } from '@/hooks/useAddresses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressTypeBadges } from './AddressTypeBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { Address } from '@/types/address';
import { AddressTypeFilters } from './AddressBookFilters';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
interface AddressBookTableProps {
  filters: AddressTypeFilters;
  search?: string;
}
export const AddressBookTable = ({
  filters,
  search
}: AddressBookTableProps) => {
  const navigate = useNavigate();
  const [companySort, setCompanySort] = useState<'asc' | 'desc' | null>(null);
  const {
    data: addresses,
    isLoading,
    error
  } = useAddresses(search);
  const filteredAddresses = useMemo(() => {
    if (!addresses) return [];
    
    // Apply filters
    const hasActiveFilters = Object.values(filters).some(value => value);
    let filtered = hasActiveFilters ? addresses.filter((address: Address) => {
      if (filters.contact && address.is_contact) return true;
      if (filters.supplier && address.is_supplier) return true;
      if (filters.manufacturer && address.is_manufacturer) return true;
      if (filters.contractor && address.is_contractor) return true;
      if (filters.other && address.is_other) return true;
      return false;
    }) : addresses;
    
    // Apply sorting
    if (companySort) {
      filtered = [...filtered].sort((a, b) => {
        const aCompany = a.company_details?.company_name || '';
        const bCompany = b.company_details?.company_name || '';
        const comparison = aCompany.localeCompare(bCompany);
        return companySort === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [addresses, filters, companySort]);
  const handleRowClick = (address: Address) => {
    navigate(`/address-book/${address.id}`);
  };

  const handleCompanySort = () => {
    if (companySort === null) {
      setCompanySort('asc');
    } else if (companySort === 'asc') {
      setCompanySort('desc');
    } else {
      setCompanySort(null);
    }
  };

  const getSortIcon = () => {
    if (companySort === null) return <ArrowUpDown className="h-4 w-4" />;
    if (companySort === 'asc') return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
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
      
      <CardContent>
        {!filteredAddresses || filteredAddresses.length === 0 ? <p className="text-muted-foreground text-center py-8">
            {!addresses || addresses.length === 0 ? "No addresses found in the directory." : "No addresses match the selected filters."}
          </p> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className={`cursor-pointer hover:bg-gray-400 transition-colors ${companySort ? 'bg-blue-100' : 'bg-gray-300'}`}
                  onClick={handleCompanySort}
                >
                  <div className="flex items-center space-x-2">
                    <span>Company</span>
                    {getSortIcon()}
                  </div>
                </TableHead>
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
                    <div className="font-medium">{address.company_details?.company_name || '—'}</div>
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
      </CardContent>
    </Card>;
};