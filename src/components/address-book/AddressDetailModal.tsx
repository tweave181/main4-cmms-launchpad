import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Phone, Mail, Globe, FileText, Calendar } from 'lucide-react';
import { AddressTypeBadges } from './AddressTypeBadges';
import { SuppliedPartsCard } from './SuppliedPartsCard';
import { ContactsList } from '@/components/address-contacts/ContactsList';
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
  const [activeTab, setActiveTab] = useState('contacts');

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

  const tabs = [
    { id: 'contacts', label: 'Contacts' },
    { id: 'contracts', label: 'Contract Details' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactsList addressId={address.id} />;
      case 'contracts':
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No service contracts linked yet.</p>
            <p className="text-sm mt-2">Service contract functionality will be available soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Address Details</span>
          </DialogTitle>
        </DialogHeader>

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

          {/* Tabs Section at Bottom */}
          <div className="flex h-full flex-col space-y-4">
            <div
              className="flex border-b border-border"
              role="tablist"
              aria-label="Address detail sections"
            >
              {tabs.map((tab, idx) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={active}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') {
                        const next = (idx + 1) % tabs.length
                        setActiveTab(tabs[next].id)
                      } else if (e.key === 'ArrowLeft') {
                        const prev = (idx - 1 + tabs.length) % tabs.length
                        setActiveTab(tabs[prev].id)
                      }
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none ${
                      active
                        ? 'text-foreground border-primary'
                        : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <div
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className="mt-4 flex-1 min-h-0 overflow-auto"
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};