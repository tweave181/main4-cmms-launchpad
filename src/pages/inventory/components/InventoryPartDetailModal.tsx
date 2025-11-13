import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Edit, Package, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'] & {
  unit_cost?: number | null;
};

interface InventoryPartDetailModalProps {
  part: InventoryPart | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (part: InventoryPart) => void;
  onDelete: (partId: string) => void;
}

export const InventoryPartDetailModal: React.FC<InventoryPartDetailModalProps> = ({
  part,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  const { userProfile } = useAuth();
  const { formatCurrency } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!part) return null;

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const stockStatus = getStockStatus(part.quantity_in_stock, part.reorder_threshold);

  const handleDelete = () => {
    onDelete(part.id);
    setDeleteDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {part.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SKU: {part.sku}</p>
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onEdit(part)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {part.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{part.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Stock Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                    <span className="font-medium">{part.quantity_in_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reorder Threshold:</span>
                    <span>{part.reorder_threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit of Measure:</span>
                    <span>{part.unit_of_measure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit Cost:</span>
                    <span>{part.unit_cost ? formatCurrency(part.unit_cost) : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span>{part.category || 'Uncategorized'}</span>
                  </div>
                  {part.linked_asset_type && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Asset Type:</span>
                      <span>{part.linked_asset_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span>{format(new Date(part.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            {part.storage_locations && part.storage_locations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Storage Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {part.storage_locations.map((location, index) => (
                      <Badge key={index} variant="outline">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Inventory Part"
        description={`Are you sure you want to delete "${part.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};