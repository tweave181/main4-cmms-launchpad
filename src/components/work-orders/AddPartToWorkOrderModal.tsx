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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAddPartToWorkOrder } from '@/hooks/useWorkOrderParts';
import { useAuth } from '@/contexts/auth';

interface AddPartToWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
}

export const AddPartToWorkOrderModal: React.FC<AddPartToWorkOrderModalProps> = ({
  isOpen,
  onClose,
  workOrderId,
}) => {
  const { userProfile } = useAuth();
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const addPartMutation = useAddPartToWorkOrder();

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .select('id, name, sku, quantity_in_stock, unit_of_measure')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const selectedPart = parts.find((p) => p.id === selectedPartId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !userProfile?.tenant_id) return;

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    await addPartMutation.mutateAsync({
      workOrderId,
      partId: selectedPartId,
      quantityUsed: quantityNum,
      tenantId: userProfile.tenant_id,
    });

    setSelectedPartId('');
    setQuantity('1');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="part">Select Part</Label>
              <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a part" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading parts...
                    </SelectItem>
                  ) : parts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No parts available
                    </SelectItem>
                  ) : (
                    parts.map((part) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name} ({part.sku}) - Stock: {part.quantity_in_stock}{' '}
                        {part.unit_of_measure}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedPart && (
                <p className="text-sm text-muted-foreground">
                  Available stock: {selectedPart.quantity_in_stock}{' '}
                  {selectedPart.unit_of_measure}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Used</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedPart?.quantity_in_stock || 999999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedPartId || addPartMutation.isPending}
            >
              Add Part
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
