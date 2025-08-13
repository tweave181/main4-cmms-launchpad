import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';
import type { Address } from '@/types/address';
import { AddressViewEditModal } from './AddressViewEditModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
interface AddressListProps {
  onAddAddress: () => void;
}
export const AddressList: React.FC<AddressListProps> = ({
  onAddAddress
}) => {
  const {
    formatDate
  } = useGlobalSettings();
  const [search, setSearch] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const {
    data: addresses = [],
    isLoading
  } = useAddresses(search);
  const deleteAddressMutation = useDeleteAddress();
  const formatAddressPreview = (address: Address) => {
    const parts = [address.address_line_1, address.town_or_city, address.postcode].filter(Boolean);
    return parts.join(', ');
  };
  const handleDelete = async () => {
    if (deletingAddress) {
      await deleteAddressMutation.mutateAsync(deletingAddress.id);
      setDeletingAddress(null);
    }
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
            <Input placeholder="Search addresses by line 1, town, or postcode..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={onAddAddress} className="rounded-2xl">
            Add Address
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-300">Address</TableHead>
                <TableHead className="bg-gray-300">Town/City</TableHead>
                <TableHead className="bg-gray-300">Postcode</TableHead>
                <TableHead className="bg-gray-300">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.length === 0 ? <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {search ? 'No addresses found matching your search.' : 'No addresses found. Create your first address to get started.'}
                  </TableCell>
                </TableRow> : addresses.map(address => <TableRow key={address.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAddressId(address.id)}>
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

      {/* Unified View/Edit Modal */}
      <AddressViewEditModal addressId={selectedAddressId} isOpen={!!selectedAddressId} onClose={() => setSelectedAddressId(null)} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAddress} onOpenChange={() => setDeletingAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
              {deletingAddress && <div className="mt-2 text-sm bg-muted p-2 rounded">
                  {formatAddressPreview(deletingAddress)}
                </div>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};