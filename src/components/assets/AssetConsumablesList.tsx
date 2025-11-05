import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useAssetSpareParts, useDeleteAssetSparePart } from '@/hooks/queries/useAssetSpareParts';
import { AddAssetConsumableModal } from './AddAssetConsumableModal';
import { EditAssetConsumableModal } from './EditAssetConsumableModal';
import { useToast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';

type AssetConsumable = {
  part_id: string;
  name: string;
  sku: string;
  quantity_required: number;
  unit_of_measure?: string;
};

interface AssetConsumablesListProps {
  assetId: string;
}

export const AssetConsumablesList: React.FC<AssetConsumablesListProps> = ({ assetId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<AssetConsumable | null>(null);
  const { toast } = useToast();

  const { data: spareParts, isLoading, refetch } = useAssetSpareParts(assetId);
  const deletePartMutation = useDeleteAssetSparePart();

  // Filter to only show consumables
  const consumables = spareParts?.filter(part => 
    part.inventory_type === 'consumables'
  ) || [];

  const handleDeletePart = async (partId: string) => {
    if (confirm('Are you sure you want to remove this consumable from the asset?')) {
      try {
        await deletePartMutation.mutateAsync({ assetId, partId });
        toast({
          title: "Success",
          description: "Consumable removed successfully",
        });
        refetch();
      } catch (error) {
        handleError(error, 'AssetConsumablesList', {
          showToast: true,
          toastTitle: "Failed to Remove Consumable",
          additionalData: { assetId, partId: partId },
        });
      }
    }
  };

  const handlePartAdded = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handlePartUpdated = () => {
    setEditingPart(null);
    refetch();
  };

  const openPartDetail = (partId: string) => {
    window.open(`/inventory/parts/${partId}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading consumables...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Consumables</CardTitle>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Consumable
          </Button>
        </CardHeader>
        <CardContent>
          {consumables.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                No consumables linked to this asset yet.
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Consumable
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {consumables.map((part) => (
                <div
                  key={part.part_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPartDetail(part.part_id)}
                        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {part.name}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                      <Badge variant="outline" className="text-xs">
                        {part.sku}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {part.quantity_required}
                      {part.unit_of_measure && ` ${part.unit_of_measure}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPart(part)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePart(part.part_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAssetConsumableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        assetId={assetId}
        onPartAdded={handlePartAdded}
      />

      {editingPart && (
        <EditAssetConsumableModal
          isOpen={true}
          onClose={() => setEditingPart(null)}
          assetId={assetId}
          part={editingPart}
          onPartUpdated={handlePartUpdated}
        />
      )}
    </div>
  );
};
