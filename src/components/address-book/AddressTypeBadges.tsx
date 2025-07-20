import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/types/address';

interface AddressTypeBadgesProps {
  address: Address;
}

export const AddressTypeBadges = ({ address }: AddressTypeBadgesProps) => {
  const badges = [];

  if (address.is_contact) {
    badges.push(
      <Badge key="contact" variant="secondary">
        Contact
      </Badge>
    );
  }

  if (address.is_supplier) {
    badges.push(
      <Badge key="supplier" variant="outline">
        Supplier
      </Badge>
    );
  }

  if (address.is_manufacturer) {
    badges.push(
      <Badge key="manufacturer" variant="outline">
        Manufacturer
      </Badge>
    );
  }

  if (address.is_contractor) {
    badges.push(
      <Badge key="contractor" variant="outline">
        Contractor
      </Badge>
    );
  }

  if (address.is_other) {
    badges.push(
      <Badge key="other" variant="outline">
        Other
      </Badge>
    );
  }

  if (badges.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges}
    </div>
  );
};