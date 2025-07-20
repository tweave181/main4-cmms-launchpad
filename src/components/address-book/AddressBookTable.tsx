import React from 'react';
import { useAddresses } from '@/hooks/useAddresses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressTypeBadges } from './AddressTypeBadges';
import { Skeleton } from '@/components/ui/skeleton';

export const AddressBookTable = () => {
  const { data: addresses, isLoading, error } = useAddresses();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Address Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Address Book</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading addresses: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Book</CardTitle>
      </CardHeader>
      <CardContent>
        {!addresses || addresses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No addresses found in the directory.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Town/City</TableHead>
                <TableHead>Postcode</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((address) => (
                <TableRow key={address.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{address.address_line_1}</div>
                      {address.address_line_2 && (
                        <div className="text-sm text-muted-foreground">{address.address_line_2}</div>
                      )}
                      {address.address_line_3 && (
                        <div className="text-sm text-muted-foreground">{address.address_line_3}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{address.town_or_city || '-'}</TableCell>
                  <TableCell>{address.postcode || '-'}</TableCell>
                  <TableCell>
                    <AddressTypeBadges address={address} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};