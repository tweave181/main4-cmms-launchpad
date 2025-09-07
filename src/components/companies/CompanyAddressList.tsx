import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit2 } from 'lucide-react';
import { useCompanyAddresses } from '@/hooks/useCompanyAddresses';
import { AddressCard } from '@/components/ui/address-card';
import type { CompanyDetails } from '@/types/company';

interface CompanyAddressListProps {
  company: CompanyDetails;
  onAddAddress: () => void;
}

export const CompanyAddressList: React.FC<CompanyAddressListProps> = ({
  company,
  onAddAddress
}) => {
  const { data: addresses, isLoading } = useCompanyAddresses(company.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading addresses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Address Information
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddAddress}>
            <Edit2 className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4">
                <AddressCard 
                  address={{
                    line1: address.address_line_1,
                    line2: address.address_line_2,
                    line3: address.address_line_3,
                    town_city: address.town_or_city,
                    county_state: address.county_or_state,
                    postcode: address.postcode
                  }}
                />
                
                {/* Contact Information */}
                {(address.contact_name || address.phone || address.email) && (
                  <div className="mt-3 pt-3 border-t border-muted">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {address.contact_name && (
                        <div>
                          <span className="font-medium text-muted-foreground">Contact:</span>
                          <div>{address.contact_name}</div>
                        </div>
                      )}
                      {address.phone && (
                        <div>
                          <span className="font-medium text-muted-foreground">Phone:</span>
                          <div>{address.phone}</div>
                        </div>
                      )}
                      {address.email && (
                        <div>
                          <span className="font-medium text-muted-foreground">Email:</span>
                          <div>{address.email}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address Types */}
                <div className="mt-3 pt-3 border-t border-muted">
                  <div className="flex flex-wrap gap-2">
                    {address.is_contact && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Contact
                      </span>
                    )}
                    {address.is_supplier && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Supplier
                      </span>
                    )}
                    {address.is_manufacturer && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Manufacturer
                      </span>
                    )}
                    {address.is_contractor && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Contractor
                      </span>
                    )}
                    {address.is_other && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Other
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground">No addresses assigned to this company</p>
              <Button variant="outline" size="sm" onClick={onAddAddress}>
                Add Address
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};