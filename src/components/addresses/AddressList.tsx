import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [companySort, setCompanySort] = useState<'asc' | 'desc' | null>(null);
  const {
    data: addresses = [],
    isLoading
  } = useAddresses(search);
  const sortedAddresses = useMemo(() => {
    if (!companySort) return addresses;
    
    return [...addresses].sort((a, b) => {
      const aCompany = a.company_details?.company_name || '';
      const bCompany = b.company_details?.company_name || '';
      const comparison = aCompany.localeCompare(bCompany);
      return companySort === 'asc' ? comparison : -comparison;
    });
  }, [addresses, companySort]);

  const handleRowClick = (address: Address) => {
    navigate(`/addresses/${address.id}`);
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
                <TableHead className="bg-gray-300">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {sortedAddresses.length === 0 ? <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? 'No addresses found matching your search.' : 'No addresses found. Create your first address to get started.'}
                  </TableCell>
                </TableRow> : sortedAddresses.map(address => <TableRow
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