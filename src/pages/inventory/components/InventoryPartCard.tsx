
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Edit2, Trash2, Package, MapPin } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

interface InventoryPartCardProps {
  part: InventoryPart;
  onView: (part: InventoryPart) => void;
  onEdit: (part: InventoryPart) => void;
  onDelete: (partId: string) => void;
}

export const InventoryPartCard: React.FC<InventoryPartCardProps> = ({
  part,
  onView,
  onEdit,
  onDelete,
}) => {
  const isLowStock = part.quantity_in_stock <= part.reorder_threshold;
  const isOutOfStock = part.quantity_in_stock === 0;

  const getStockBadgeColor = () => {
    if (isOutOfStock) return 'bg-red-100 text-red-800';
    if (isLowStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Card className="rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{part.name}</h3>
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">SKU: {part.sku}</p>
            {part.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{part.description}</p>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(part)}
              className="p-1 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(part)}
              className="p-1 h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(part.id)}
              className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {part.quantity_in_stock} {part.unit_of_measure}
              </span>
            </div>
            <Badge className={getStockBadgeColor()}>
              {getStockStatus()}
            </Badge>
          </div>

          {part.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Category:</span>
              <Badge variant="outline" className="text-xs">
                {part.category}
              </Badge>
            </div>
          )}

          {part.storage_locations && part.storage_locations.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {part.storage_locations.join(', ')}
              </span>
            </div>
          )}

          {part.reorder_threshold > 0 && (
            <div className="text-xs text-gray-500">
              Reorder at: {part.reorder_threshold} {part.unit_of_measure}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
