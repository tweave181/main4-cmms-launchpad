import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, Building2, Phone, Mail, Globe } from 'lucide-react';
import { AddressDetailTabs } from '@/components/addresses/AddressDetailTabs';
import { AddressTypeBadges } from '@/components/address-book/AddressTypeBadges';
import { useAddress } from '@/hooks/useAddresses';

const AddressDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: address, isLoading, error } = useAddress(id!);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Address not found or you don't have access to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="rounded-2xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Address Details Card */}
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Address Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company */}
            {address.company_details && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Company</span>
                </div>
                <p className="font-medium">{address.company_details.company_name}</p>
              </div>
            )}

            {/* Contact Name */}
            {address.contact_name && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <span>Contact Name</span>
                </div>
                <p className="font-medium">{address.contact_name}</p>
              </div>
            )}

            {/* Phone */}
            {address.phone && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </div>
                <p className="font-medium">{address.phone}</p>
              </div>
            )}

            {/* Email */}
            {address.email && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{address.email}</p>
              </div>
            )}

            {/* Website */}
            {address.website && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </div>
                <p className="font-medium">{address.website}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Address</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{address.address_line_1}</p>
              {address.address_line_2 && <p className="text-muted-foreground">{address.address_line_2}</p>}
              {address.address_line_3 && <p className="text-muted-foreground">{address.address_line_3}</p>}
              <div className="flex space-x-4">
                {address.town_or_city && <span>{address.town_or_city}</span>}
                {address.county_or_state && <span>{address.county_or_state}</span>}
                {address.postcode && <span className="font-medium">{address.postcode}</span>}
              </div>
            </div>
          </div>

          {/* Address Types */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Type</div>
            <AddressTypeBadges address={address} />
          </div>

          {/* Notes */}
          {address.notes && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <p className="text-sm bg-muted p-3 rounded-md">{address.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Tabs at the bottom */}
      <AddressDetailTabs address={address} />
    </div>
  );
};

export default AddressDetail;