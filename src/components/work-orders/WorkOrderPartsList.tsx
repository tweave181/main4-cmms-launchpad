import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Plus, Trash2, Edit2, Check, X, Layers } from 'lucide-react';
import {
  useWorkOrderParts,
  useRemovePartFromWorkOrder,
  useUpdatePartUsage,
  useBulkAddPartsToWorkOrder,
} from '@/hooks/useWorkOrderParts';
import { AddPartToWorkOrderModal } from './AddPartToWorkOrderModal';
import { BulkAddPartsModal } from './BulkAddPartsModal';
import { useAuth } from '@/contexts/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkOrderPartsListProps {
  workOrderId: string;
}

export const WorkOrderPartsList: React.FC<WorkOrderPartsListProps> = ({
  workOrderId,
}) => {
  const { userProfile } = useAuth();
  const { data: parts = [], isLoading } = useWorkOrderParts(workOrderId);
  const removeMutation = useRemovePartFromWorkOrder();
  const updateMutation = useUpdatePartUsage();
  const bulkAddMutation = useBulkAddPartsToWorkOrder();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');

  const handleRemove = (usageId: string) => {
    if (confirm('Remove this part from the work order? Stock will be returned to inventory.')) {
      removeMutation.mutate({ usageId, workOrderId });
    }
  };

  const handleStartEdit = (usageId: string, currentQuantity: number) => {
    setEditingId(usageId);
    setEditQuantity(currentQuantity.toString());
  };

  const handleSaveEdit = (usageId: string) => {
    const quantity = parseInt(editQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    updateMutation.mutate(
      { usageId, quantityUsed: quantity, workOrderId },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditQuantity('');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
  };

  const handleBulkAdd = async (
    selectedParts: Array<{ partId: string; quantity: number }>
  ) => {
    if (!userProfile?.tenant_id) return;

    await bulkAddMutation.mutateAsync({
      workOrderId,
      parts: selectedParts,
      tenantId: userProfile.tenant_id,
    });
  };

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Parts Used</span>
              {parts.length > 0 && (
                <Badge variant="secondary">{parts.length}</Badge>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Parts</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Single Part
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBulkAddModalOpen(true)}>
                  <Layers className="h-4 w-4 mr-2" />
                  Add Multiple Parts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading parts...</div>
          ) : parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No parts used yet</p>
              <p className="text-xs mt-1">Track parts consumed during this work order</p>
            </div>
          ) : (
            <div className="space-y-2">
              {parts.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {usage.part?.name || 'Unknown Part'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>SKU: {usage.part?.sku}</span>
                      <span>•</span>
                      <span>
                        Current Stock: {usage.part?.quantity_in_stock}{' '}
                        {usage.part?.unit_of_measure}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingId === usage.id ? (
                      <>
                        <Input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-20 h-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveEdit(usage.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline" className="font-mono">
                          {usage.quantity_used} {usage.part?.unit_of_measure}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStartEdit(usage.id, usage.quantity_used)
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(usage.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPartToWorkOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        workOrderId={workOrderId}
      />

      <BulkAddPartsModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        workOrderId={workOrderId}
        onSubmit={handleBulkAdd}
      />
    </>
  );
};
