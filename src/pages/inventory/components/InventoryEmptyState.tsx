
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface InventoryEmptyStateProps {
  searchTerm: string;
  onCreatePart: () => void;
}

export const InventoryEmptyState: React.FC<InventoryEmptyStateProps> = ({
  searchTerm,
  onCreatePart,
}) => {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
      <p className="text-gray-500 mb-4">
        {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first inventory part.'}
      </p>
      {!searchTerm && (
        <Button onClick={onCreatePart} className="rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Button>
      )}
    </div>
  );
};
