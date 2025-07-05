import React from 'react';
import type { Address } from '@/types/address';

interface AddressDisplayProps {
  address: Address | null;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ 
  address, 
  className = '' 
}) => {
  if (!address) {
    return <span className="text-muted-foreground">No address provided</span>;
  }

  const addressLines = [
    address.address_line_1,
    address.address_line_2,
    address.address_line_3,
    address.town_or_city,
    address.county_or_state,
    address.postcode,
  ].filter(Boolean);

  return (
    <div className={`space-y-1 ${className}`}>
      {addressLines.map((line, index) => (
        <div key={index} className="text-sm">
          {line}
        </div>
      ))}
    </div>
  );
};