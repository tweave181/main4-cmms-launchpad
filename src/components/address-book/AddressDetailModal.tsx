import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Phone, Mail, Globe, FileText, Calendar } from 'lucide-react';
import { AddressTypeBadges } from './AddressTypeBadges';
import { SuppliedPartsCard } from './SuppliedPartsCard';
import { ContactsList } from '@/components/address-contacts/ContactsList';
import { ReusableTabs, TabItem } from '@/components/ui/reusable-tabs';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Address } from '@/types/address';

interface AddressDetailModalProps {
  address: Address | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddressDetailModal: React.FC<AddressDetailModalProps> = ({
  address,
  isOpen,
  onClose,
}) => {
  const { formatDate } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState('details');

  const getFullAddress = (addr: Address) => {
    const parts = [
      addr.address_line_1,
      addr.address_line_2,
      addr.address_line_3,
      addr.town_or_city,
      addr.county_or_state,
      addr.postcode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (!address) return null;

  const detailsContent = (
    <div className="space-y-6">
      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Address Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">{getFullAddress(address)}</p>
            <AddressTypeBadges address={address} />
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      {address.company_details && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{address.company_details.company_name}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {(address.contact_name || address.phone || address.email || address.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {address.contact_name && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Name</p>
                <p className="text-sm font-medium">{address.contact_name}</p>
              </div>
            )}
            {address.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{address.phone}</span>
              </div>
            )}
            {address.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{address.email}</span>
              </div>
            )}
            {address.website && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{address.website}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Type Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="w-4 h-4" />
            <span>Type Classification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressTypeBadges address={address} />
        </CardContent>
      </Card>

      {/* Record Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Record Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{formatDate(address.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p>{formatDate(address.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplied Parts */}
      {address.is_supplier && (
        <SuppliedPartsCard supplierId={address.id} />
      )}

      {/* Notes */}
      {address.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{address.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const tabs: TabItem[] = [
    {
      value: 'details',
      label: 'Details',
      icon: Building,
      content: detailsContent,
    },
    {
      value: 'contacts',
      label: 'Contacts',
      icon: Phone,
      content: <ContactsList addressId={address.id} />,
    },
    {
      value: 'contracts',
      label: 'Service Contracts',
      icon: FileText,
      content: (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No service contracts linked yet.</p>
          <p className="text-sm mt-2">Service contract functionality will be available soon.</p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Address Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ReusableTabs
            tabs={tabs}
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};