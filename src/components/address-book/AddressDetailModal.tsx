import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Address } from '@/types/address';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { AddressTypeBadges } from './AddressTypeBadges';
import { SuppliedPartsCard } from './SuppliedPartsCard';
import { AddressCard } from '@/components/ui/address-card';
interface AddressDetailModalProps {
  address: Address | null;
  isOpen: boolean;
  onClose: () => void;
}
export const AddressDetailModal = ({
  address,
  isOpen,
  onClose
}: AddressDetailModalProps) => {
  if (!address) return null;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const getFullAddress = () => {
    const addressParts = [address.address_line_1, address.address_line_2, address.address_line_3, address.town_or_city, address.county_or_state, address.postcode].filter(Boolean);
    return addressParts.join(', ');
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {address.company_details?.company_name ? address.company_details.company_name : 'Address Information'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Address Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>
            
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
          </div>

          <Separator />

          {/* Company Information Section */}
          {address.company_details && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <div className="font-medium">{address.company_details.company_name}</div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                <div className={address.contact_name ? "" : "text-muted-foreground italic"}>
                  {address.contact_name || 'Not available in current data'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className={address.phone ? "" : "text-muted-foreground italic"}>
                  {address.phone || 'Not available in current data'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className={address.email ? "" : "text-muted-foreground italic"}>
                  {address.email || 'Not available in current data'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <div className={address.website ? "" : "text-muted-foreground italic"}>
                  {address.website || 'Not available in current data'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Classification Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Type Classification</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Company Types</label>
              <AddressTypeBadges address={address} />
            </div>
          </div>

          <Separator />

          {/* Record Information */}
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>Record Information</span>
              <span>Created At: {formatDate(address.created_at)}</span>
              <span>Last Updated: {formatDate(address.updated_at)}</span>
            </span>
          </div>

          {/* Supplied Parts Section - only show for suppliers */}
          {address.is_supplier && (
            <>
              <Separator />
              <SuppliedPartsCard supplierId={address.id} />
            </>
          )}

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-muted-foreground italic">
                {address.notes || 'No additional notes available for this address record.'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};