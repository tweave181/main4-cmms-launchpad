import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateAssetSparePart } from '@/hooks/queries/useAssetSpareParts';
import { useToast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';

interface AssetConsumable {
  part_id: string;
  name: string;
  sku: string;
  quantity_required: number;
  unit_of_measure?: string;
}

interface EditAssetConsumableModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  part: AssetConsumable;
  onPartUpdated: () => void;
}

export const EditAssetConsumableModal: React.FC<EditAssetConsumableModalProps> = ({
  isOpen,
  onClose,
  assetId,
  part,
  onPartUpdated
}) => {
  const [quantityRequired, setQuantityRequired] = useState(part.quantity_required);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updatePartMutation = useUpdateAssetSparePart();

  useEffect(() => {
    setQuantityRequired(part.quantity_required);
  }, [part.quantity_required]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantityRequired < 1) {
      toast({
        title: "Validation Error",
        description: "Quantity must be at least 1",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePartMutation.mutateAsync({
        assetId,
        partId: part.part_id,
        quantityRequired
      });
      
      toast({
        title: "Success",
        description: "Consumable quantity updated successfully"
      });
      
      onPartUpdated();
    } catch (error) {
      handleError(error, 'EditAssetConsumableModal', {
        showToast: true,
        toastTitle: "Failed to Update Quantity",
        additionalData: { assetId, partId: part.part_id, quantityRequired },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantityRequired(part.quantity_required);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Consumable Quantity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Consumable</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{part.name}</div>
              <div className="text-sm text-muted-foreground">
                SKU: {part.sku}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Required</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Enter quantity required"
            />
            {part.unit_of_measure && (
              <div className="text-sm text-muted-foreground">
                Unit: {part.unit_of_measure}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || quantityRequired === part.quantity_required}
            >
              {isSubmitting ? 'Updating...' : 'Update Quantity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
