import React, { useState } from 'react';
import { GripVertical, Trash2, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChecklistTypeBadge } from '@/components/checklist-library/ChecklistTypeIcons';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { PMScheduleTemplateItem } from '@/types/checklistTemplate';

interface SelectedChecklistItemsProps {
  items: PMScheduleTemplateItem[];
  onRemove: (itemId: string) => void;
  onReorder: (items: PMScheduleTemplateItem[]) => void;
}

export const SelectedChecklistItems: React.FC<SelectedChecklistItemsProps> = ({
  items,
  onRemove,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Update sort_order
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));

    onReorder(updatedItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemove = (itemId: string, isSafetyCritical: boolean) => {
    if (isSafetyCritical) {
      // Safety-critical items should not be removable, but just in case
      return;
    }
    setRemoveConfirm(itemId);
  };

  const confirmRemove = () => {
    if (removeConfirm) {
      onRemove(removeConfirm);
      setRemoveConfirm(null);
    }
  };

  const safetyCriticalCount = items.filter((item) => item.template?.safety_critical).length;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No checklist items selected</p>
          <p className="text-sm mt-1">Click "Add from Library" to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} selected
              {safetyCriticalCount > 0 && (
                <span className="ml-2">
                  ({safetyCriticalCount} safety-critical)
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => {
              const template = item.template;
              if (!template) return null;

              const isSafetyCritical = template.safety_critical;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-3 p-3 border rounded-lg bg-card ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } cursor-move hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>

                  {template.image_url && (
                    <img
                      src={template.image_url}
                      alt=""
                      className="h-12 w-12 rounded object-cover flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{template.item_text}</span>
                      {isSafetyCritical && (
                        <Badge variant="destructive" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Safety Critical
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    )}
                    <ChecklistTypeBadge type={template.item_type} />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id, isSafetyCritical)}
                          disabled={isSafetyCritical}
                          className={isSafetyCritical ? 'text-muted-foreground' : 'text-destructive hover:text-destructive'}
                        >
                          {isSafetyCritical ? <Lock className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSafetyCritical
                          ? 'Safety-critical items cannot be removed'
                          : 'Remove item from schedule'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={removeConfirm !== null}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={confirmRemove}
        title="Remove Checklist Item"
        description="Are you sure you want to remove this item from the schedule?"
        confirmText="Remove"
        variant="destructive"
      />
    </>
  );
};
