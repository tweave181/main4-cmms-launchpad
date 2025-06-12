
import React from 'react';
import { InventoryPartCard } from './InventoryPartCard';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

interface InventoryPartListProps {
  parts: InventoryPart[];
  onViewPart: (part: InventoryPart) => void;
  onEditPart: (part: InventoryPart) => void;
  onDeletePart: (partId: string) => void;
}

export const InventoryPartList: React.FC<InventoryPartListProps> = ({
  parts,
  onViewPart,
  onEditPart,
  onDeletePart,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parts.map((part) => (
        <InventoryPartCard
          key={part.id}
          part={part}
          onView={onViewPart}
          onEdit={onEditPart}
          onDelete={onDeletePart}
        />
      ))}
    </div>
  );
};
