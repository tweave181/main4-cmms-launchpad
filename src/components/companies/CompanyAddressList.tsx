import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { useCompanyAddresses } from '@/hooks/useCompanyAddresses';
import type { CompanyDetails } from '@/types/company';

interface CompanyAddressListProps {
  company: CompanyDetails;
}

export const CompanyAddressList: React.FC<CompanyAddressListProps> = ({
  company
}) => {
  const { data: addresses, isLoading } = useCompanyAddresses(company.id);

  const handleAddressClick = (addressId: string) => {
    // Navigate to address record - you can implement this navigation logic
    console.log('Navigate to address:', addressId);
  };

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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Address Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {addresses && addresses.length > 0 ? (
          <div className="space-y-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => handleAddressClick(address.id)}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </h4>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {[
                        address.address_line_3,
                        address.town_or_city,
                        address.county_or_state,
                        address.postcode
                      ].filter(Boolean).join(', ')}
                    </div>

                    {(address.contact_name || address.phone || address.email) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {address.contact_name && (
                          <span>Contact: {address.contact_name}</span>
                        )}
                        {address.contact_name && (address.phone || address.email) && ' • '}
                        {address.phone && <span>Phone: {address.phone}</span>}
                        {address.phone && address.email && ' • '}
                        {address.email && <span>Email: {address.email}</span>}
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1">
                      {address.is_contact && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Contact
                        </span>
                      )}
                      {address.is_supplier && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Supplier
                        </span>
                      )}
                      {address.is_manufacturer && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          Manufacturer
                        </span>
                      )}
                      {address.is_contractor && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                          Contractor
                        </span>
                      )}
                      {address.is_other && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Other
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">No addresses assigned to this company</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};