import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Package, AlertCircle } from 'lucide-react';
import { z } from 'zod';

interface BulkAddPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  onSubmit: (parts: Array<{ partId: string; quantity: number }>) => Promise<void>;
}

interface PartSelection {
  partId: string;
  selected: boolean;
  quantity: string;
}

const quantitySchema = z.number().int().positive().max(999999);

export const BulkAddPartsModal: React.FC<BulkAddPartsModalProps> = ({
  isOpen,
  onClose,
  workOrderId,
  onSubmit,
}) => {
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partSelections, setPartSelections] = useState<Record<string, PartSelection>>({});

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .select('id, name, sku, quantity_in_stock, unit_of_measure')
        .gt('quantity_in_stock', 0)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const handleTogglePart = (partId: string) => {
    setPartSelections((prev) => ({
      ...prev,
      [partId]: {
        partId,
        selected: !prev[partId]?.selected,
        quantity: prev[partId]?.quantity || '1',
      },
    }));
  };

  const handleQuantityChange = (partId: string, value: string) => {
    setPartSelections((prev) => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        partId,
        quantity: value,
      },
    }));
  };

  const getSelectedParts = () => {
    return Object.values(partSelections).filter((s) => s.selected);
  };

  const validateSelection = (): { valid: boolean; errors: string[] } => {
    const selectedParts = getSelectedParts();
    const errors: string[] = [];

    if (selectedParts.length === 0) {
      errors.push('Please select at least one part');
      return { valid: false, errors };
    }

    for (const selection of selectedParts) {
      const part = parts.find((p) => p.id === selection.partId);
      if (!part) continue;

      const quantity = parseInt(selection.quantity);
      
      // Validate quantity is a positive integer
      const quantityResult = quantitySchema.safeParse(quantity);
      if (!quantityResult.success) {
        errors.push(`${part.name}: Invalid quantity`);
        continue;
      }

      // Check stock availability
      if (quantity > part.quantity_in_stock) {
        errors.push(
          `${part.name}: Requested ${quantity} but only ${part.quantity_in_stock} in stock`
        );
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    const { valid, errors } = validateSelection();

    if (!valid) {
      alert(errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedParts = getSelectedParts().map((s) => ({
        partId: s.partId,
        quantity: parseInt(s.quantity),
      }));

      await onSubmit(selectedParts);
      setPartSelections({});
      onClose();
    } catch (error) {
      console.error('Failed to add parts:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = getSelectedParts().length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Add Multiple Parts to Work Order</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedCount} part{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPartSelections({})}
              >
                Clear All
              </Button>
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading parts...
              </div>
            ) : parts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No parts available in stock</p>
              </div>
            ) : (
              <div className="space-y-2">
                {parts.map((part) => {
                  const isSelected = partSelections[part.id]?.selected || false;
                  const quantity = partSelections[part.id]?.quantity || '1';
                  const quantityNum = parseInt(quantity);
                  const hasError =
                    isSelected &&
                    (isNaN(quantityNum) ||
                      quantityNum <= 0 ||
                      quantityNum > part.quantity_in_stock);

                  return (
                    <div
                      key={part.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleTogglePart(part.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{part.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>SKU: {part.sku}</span>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className={
                              part.quantity_in_stock <= 5
                                ? 'border-orange-500 text-orange-600'
                                : ''
                            }
                          >
                            Stock: {part.quantity_in_stock} {part.unit_of_measure}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max={part.quantity_in_stock}
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(part.id, e.target.value)
                            }
                            className={`w-20 h-8 ${
                              hasError ? 'border-destructive' : ''
                            }`}
                            placeholder="Qty"
                          />
                          <span className="text-xs text-muted-foreground">
                            {part.unit_of_measure}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedCount === 0 || isSubmitting}
          >
            Add {selectedCount > 0 ? `${selectedCount} Part${selectedCount !== 1 ? 's' : ''}` : 'Parts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
