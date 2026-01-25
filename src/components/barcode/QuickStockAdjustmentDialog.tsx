import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PartInfo {
  id: string;
  name: string;
  sku: string;
  quantity_in_stock: number;
  unit_of_measure: string;
}

interface QuickStockAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartInfo | null;
  onConfirm: (adjustment: {
    partId: string;
    transactionType: 'restock' | 'usage';
    quantityChange: number;
    quantityAfter: number;
    notes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const QuickStockAdjustmentDialog: React.FC<QuickStockAdjustmentDialogProps> = ({
  isOpen,
  onClose,
  part,
  onConfirm,
  isSubmitting = false,
}) => {
  const [transactionType, setTransactionType] = useState<'restock' | 'usage'>('restock');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when dialog opens with new part
  useEffect(() => {
    if (isOpen && part) {
      setTransactionType('restock');
      setQuantity('');
      setNotes('');
    }
  }, [isOpen, part?.id]);

  if (!part) return null;

  const quantityNum = parseInt(quantity) || 0;
  const quantityChange = transactionType === 'restock' ? quantityNum : -quantityNum;
  const newStock = part.quantity_in_stock + quantityChange;
  const isNegativeStock = newStock < 0;
  const isValid = quantityNum > 0 && !isNegativeStock;

  const handleConfirm = async () => {
    if (!isValid) return;

    await onConfirm({
      partId: part.id,
      transactionType,
      quantityChange: quantityNum, // Always positive, sign determined by type
      quantityAfter: newStock,
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Stock Adjustment
          </DialogTitle>
          <DialogDescription>
            Adjust inventory for the scanned part
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Part Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium text-foreground">{part.name}</p>
            <p className="text-sm text-muted-foreground">SKU: {part.sku}</p>
            <p className="text-sm">
              Current Stock: <span className="font-semibold">{part.quantity_in_stock} {part.unit_of_measure}</span>
            </p>
          </div>

          {/* Action Toggle */}
          <div className="space-y-2">
            <Label>Action</Label>
            <ToggleGroup
              type="single"
              value={transactionType}
              onValueChange={(value) => value && setTransactionType(value as 'restock' | 'usage')}
              className="justify-start"
            >
              <ToggleGroupItem value="restock" aria-label="Add stock" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </ToggleGroupItem>
              <ToggleGroupItem value="usage" aria-label="Remove stock" className="flex-1">
                <Minus className="h-4 w-4 mr-2" />
                Remove Stock
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
              className="text-lg"
            />
          </div>

          {/* Stock Preview */}
          {quantityNum > 0 && (
            <div className={`rounded-lg p-3 ${isNegativeStock ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <p className="text-sm font-medium">
                New Stock Level:{' '}
                <span className={isNegativeStock ? 'text-destructive' : 'text-primary'}>
                  {newStock} {part.unit_of_measure}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {transactionType === 'restock' ? '+' : '-'}{quantityNum} from current {part.quantity_in_stock}
              </p>
            </div>
          )}

          {/* Negative Stock Warning */}
          {isNegativeStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cannot remove more than current stock ({part.quantity_in_stock} {part.unit_of_measure})
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a note for this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
