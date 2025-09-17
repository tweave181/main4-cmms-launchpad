import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CompanyTypeBadgesProps {
  types: string[];
}

export const CompanyTypeBadges = ({ types }: CompanyTypeBadgesProps) => {
  if (!types || types.length === 0) {
    return <span className="text-muted-foreground text-sm">No types</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {types.map((type) => {
        let variant: "default" | "secondary" | "outline" = "outline";
        
        if (type === 'Contact') {
          variant = "secondary";
        }

        return (
          <Badge key={type} variant={variant}>
            {type}
          </Badge>
        );
      })}
    </div>
  );
};