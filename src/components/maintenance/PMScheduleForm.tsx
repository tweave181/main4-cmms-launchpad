import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PMAssetSelector } from './PMAssetSelector';
import { SelectChecklistFromLibrary } from './SelectChecklistFromLibrary';
import { SelectedChecklistItems } from './SelectedChecklistItems';

import { useUsers } from '@/hooks/usePreventiveMaintenance';
import { usePMScheduleTemplateItems, useAddTemplateItemsToSchedule, useRemoveTemplateItemFromSchedule, useReorderTemplateItems } from '@/hooks/usePMScheduleTemplateItems';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';
import type { ChecklistItemTemplate, PMScheduleTemplateItem } from '@/types/checklistTemplate';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const pmScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()).min(1, 'At least one asset must be selected'),
  assigned_to: z.string().optional(),
  is_active: z.boolean(),
});

interface PMScheduleFormProps {
  onSubmit: (data: PMScheduleFormData, templateItemIds: string[]) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Partial<PMScheduleFormData>;
  scheduleId?: string;
}

export const PMScheduleForm: React.FC<PMScheduleFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  initialData,
  scheduleId,
}) => {
  const { data: users = [] } = useUsers();
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [selectedTemplateItems, setSelectedTemplateItems] = React.useState<PMScheduleTemplateItem[]>([]);
  const [checklistError, setChecklistError] = React.useState<string>('');
  
  // Fetch existing template items if editing
  const { data: existingTemplateItems } = usePMScheduleTemplateItems(scheduleId || '');
  const addTemplateItems = useAddTemplateItemsToSchedule();
  const removeTemplateItem = useRemoveTemplateItemFromSchedule();
  const reorderItems = useReorderTemplateItems();

  // Load existing items on mount
  React.useEffect(() => {
    if (existingTemplateItems) {
      setSelectedTemplateItems(existingTemplateItems);
    }
  }, [existingTemplateItems]);
  
  const form = useForm<Omit<PMScheduleFormData, 'checklist_items'>>({
    resolver: zodResolver(pmScheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      instructions: initialData?.instructions || '',
      next_due_date: initialData?.next_due_date || '',
      asset_ids: initialData?.asset_ids || [],
      assigned_to: initialData?.assigned_to || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleSubmit = (data: Omit<PMScheduleFormData, 'checklist_items'>) => {
    // Validate checklist items
    if (selectedTemplateItems.length === 0) {
      setChecklistError('Please add at least one checklist item from the library');
      return;
    }
    
    setChecklistError('');
    
    // Convert "unassigned" back to empty string for the API
    const submitData: PMScheduleFormData = {
      ...data,
      assigned_to: data.assigned_to === 'unassigned' ? '' : data.assigned_to,
      checklist_items: [], // Not used anymore
    };
    
    const templateItemIds = selectedTemplateItems.map(item => item.template_item_id);
    onSubmit(submitData, templateItemIds);
  };

  const handleSelectFromLibrary = (templates: ChecklistItemTemplate[]) => {
    const newItems: PMScheduleTemplateItem[] = templates.map((template, index) => ({
      id: `temp-${Date.now()}-${index}`,
      pm_schedule_id: scheduleId || '',
      template_item_id: template.id,
      sort_order: selectedTemplateItems.length + index + 1,
      created_at: new Date().toISOString(),
      template: template,
    }));
    
    setSelectedTemplateItems([...selectedTemplateItems, ...newItems]);
    setChecklistError('');
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedTemplateItems(items => items.filter(i => i.id !== itemId));
  };

  const handleReorderItems = (reorderedItems: PMScheduleTemplateItem[]) => {
    setSelectedTemplateItems(reorderedItems);
  };

  const safetyCriticalCount = selectedTemplateItems.filter(
    item => item.template?.safety_critical
  ).length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter schedule name" 
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'unassigned'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">No assignment</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active Schedule</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable this maintenance schedule
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter schedule description"
                  {...field}
                  rows={3}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed maintenance instructions"
                  {...field}
                  rows={4}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="next_due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Due Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="text-sm font-medium">
            Select Assets for this Schedule *
          </label>
          <div className="mt-2">
            <FormField
              control={form.control}
              name="asset_ids"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PMAssetSelector
                      selectedAssetIds={field.value}
                      onSelectionChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Checklist Items Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Maintenance Checklist *
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select reusable checklist items from the library
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLibraryOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add from Library
            </Button>
          </div>

          {checklistError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{checklistError}</AlertDescription>
            </Alert>
          )}

          {selectedTemplateItems.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {selectedTemplateItems.length} item{selectedTemplateItems.length !== 1 ? 's' : ''} selected
                {safetyCriticalCount > 0 && (
                  <span className="text-destructive font-medium ml-1">
                    ({safetyCriticalCount} safety-critical)
                  </span>
                )}
              </div>
              <SelectedChecklistItems
                items={selectedTemplateItems}
                onRemove={handleRemoveItem}
                onReorder={handleReorderItems}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No checklist items selected. Click "Add from Library" to get started.
              </p>
            </div>
          )}
        </div>

        <SelectChecklistFromLibrary
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          onSelect={handleSelectFromLibrary}
          excludeIds={selectedTemplateItems.map(item => item.template_item_id)}
        />

        <div className="flex justify-start space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
