import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Eye, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Address } from '@/types/address';
import { cn } from '@/lib/utils';
interface IndexAddressCardProps {
  address: Address;
  onClick?: (address: Address) => void;
  showActions?: boolean;
  className?: string;
}
export const IndexAddressCard: React.FC<IndexAddressCardProps> = ({
  address,
  onClick,
  showActions = true,
  className
}) => {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const addressLines = [address.company_details?.company_name, address.address_line_1, address.address_line_2, address.address_line_3, address.town_or_city, address.county_or_state, address.postcode].filter(Boolean);
    const fullAddress = addressLines.join(', ');
    try {
      await navigator.clipboard.writeText(fullAddress);
      toast.success('Address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };
  const handleCardClick = () => {
    onClick?.(address);
  };
  const getTypeBadges = () => {
    const badges = [];
    if (address.is_contact) badges.push({
      label: 'Contact',
      variant: 'secondary' as const
    });
    if (address.is_supplier) badges.push({
      label: 'Supplier',
      variant: 'outline' as const
    });
    if (address.is_manufacturer) badges.push({
      label: 'Manufacturer',
      variant: 'outline' as const
    });
    if (address.is_contractor) badges.push({
      label: 'Contractor',
      variant: 'outline' as const
    });
    if (address.is_other) badges.push({
      label: 'Other',
      variant: 'outline' as const
    });
    return badges;
  };
  const typeBadges = getTypeBadges();
  return <Card className={cn("group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border relative h-[240px] overflow-hidden", onClick && "hover:border-primary/20", className)} onClick={handleCardClick}>
      {/* Red vertical line - positioned closer to text */}
    <MapPin className="absolute left-2 top-6 h-4 w-4 text-muted-foreground" />
     <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-red-500"></div>
     
     {/* Fixed positioned blue lines for consistent spacing */}
     <div className="absolute left-10 right-4 top-[42px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[78px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[104px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[130px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[156px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[182px] h-px bg-blue-500"></div>
     <div className="absolute left-10 right-4 top-[200px] h-px bg-blue-500"></div>
     
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start px-0 mx-px">
          <div className="flex-1 min-w-0">
            <div className="pl-6 relative z-10">
              <h3 className="font-semibold text-foreground truncate">
                {address.company_details?.company_name || 'No Company'}
              </h3>
              {address.contact_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {address.contact_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        {/* Address Info - Envelope Format */}
        <div className="pl-6 relative z-10">
          <p className="text-sm text-foreground font-medium">
            {address.address_line_1}
          </p>
          
          {(address.town_or_city || address.postcode) && (
            <p className="text-sm text-muted-foreground mt-1">
              {[address.town_or_city, address.postcode].filter(Boolean).join(' , ')}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="pl-6 relative z-10">
          {address.phone && (
            <p className="text-xs text-muted-foreground">
              📞 {address.phone}
            </p>
          )}
          {address.email && (
            <p className="text-xs text-muted-foreground truncate">
              ✉️ {address.email}
            </p>
          )}
        </div>

        {/* Type Badges */}
        {typeBadges.length > 0 && <div className="pl-6 relative z-10">
            <div className="flex flex-wrap gap-1">
              {typeBadges.slice(0, 3).map((badge, index) => <Badge key={index} variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>)}
              {typeBadges.length > 3 && <Badge variant="outline" className="text-xs">
                  +{typeBadges.length - 3}
                </Badge>}
            </div>
          </div>}

        {/* Actions */}
        {showActions && <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity pl-6">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
              <Copy className="h-3 w-3" />
            </Button>
            {onClick && <Button variant="ghost" size="sm" onClick={e => {
          e.stopPropagation();
          handleCardClick();
        }} className="h-8 px-2">
                <Eye className="h-3 w-3" />
              </Button>}
          </div>}
      </CardContent>
    </Card>;
};
