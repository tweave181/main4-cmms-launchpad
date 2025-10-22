import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { useDebounce } from '@/hooks/useDebounce';
import { ChecklistTypeBadge } from '@/components/checklist-library/ChecklistTypeIcons';
import type { ChecklistItemType, ChecklistItemTemplate } from '@/types/checklistTemplate';

interface SelectChecklistFromLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templates: ChecklistItemTemplate[]) => void;
  excludeIds?: string[];
}

export const SelectChecklistFromLibrary: React.FC<SelectChecklistFromLibraryProps> = ({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChecklistItemType | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch,
    item_type: typeFilter !== 'all' ? typeFilter : undefined,
  };

  const { data: templates, isLoading } = useChecklistTemplates(filters);

  const availableTemplates = templates?.filter((t) => !excludeIds.includes(t.id)) || [];

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAdd = () => {
    const selected = availableTemplates.filter((t) => selectedIds.has(t.id));
    onSelect(selected);
    setSelectedIds(new Set());
    setSearch('');
    setTypeFilter('all');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Checklist Items from Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="safety_note">Safety Note</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="to_do">To Do Something</SelectItem>
                <SelectItem value="reading">Take a Reading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </div>

          <div className="border rounded-lg overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading...</div>
            ) : availableTemplates.length > 0 ? (
              <div className="divide-y">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 hover:bg-muted/50 flex items-start gap-3 cursor-pointer"
                    onClick={() => toggleSelection(template.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(template.id)}
                      onCheckedChange={() => toggleSelection(template.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {template.image_url && (
                          <img
                            src={template.image_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{template.item_text}</span>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <ChecklistTypeBadge type={template.item_type} />
                        {template.safety_critical && (
                          <Badge variant="destructive" className="text-xs">Safety Critical</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No items found{search || typeFilter !== 'all' ? ' matching your filters' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedIds.size === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
