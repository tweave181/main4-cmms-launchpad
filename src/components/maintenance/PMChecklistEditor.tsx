
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ChecklistItem {
  item_text: string;
  item_type: 'checkbox' | 'value';
  sort_order: number;
}

interface PMChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  maxItems?: number;
}

export const PMChecklistEditor: React.FC<PMChecklistEditorProps> = ({
  items,
  onChange,
  maxItems = 20,
}) => {
  const addItem = () => {
    if (items.length >= maxItems) return;
    
    const newItem: ChecklistItem = {
      item_text: '',
      item_type: 'checkbox',
      sort_order: items.length + 1,
    };
    
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Update sort orders
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));
    onChange(updatedItems);
  };

  const updateItem = (index: number, field: keyof ChecklistItem, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'sort_order' ? parseInt(value) || 1 : value,
    };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update sort orders
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));
    
    onChange(updatedItems);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Maintenance Checklist</CardTitle>
          <span className="text-sm text-muted-foreground">
            {items.length}/{maxItems} items
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checklist items added yet. Click "Add Item" to get started.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
              <div className="flex flex-col space-y-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="h-4 w-6 p-0"
                >
                  ▲
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="h-4 w-6 p-0"
                >
                  ▼
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Enter checklist item text"
                  value={item.item_text}
                  onChange={(e) => updateItem(index, 'item_text', e.target.value)}
                />
                <Select
                  value={item.item_type}
                  onValueChange={(value: 'checkbox' | 'value') => updateItem(index, 'item_type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">Checkbox (Yes/No)</SelectItem>
                    <SelectItem value="value">Value Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        {items.length < maxItems && (
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Checklist Item
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
