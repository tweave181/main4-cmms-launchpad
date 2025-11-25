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
import { FrequencyControl, type FrequencyValue } from './FrequencyControl';
import { useUsers } from '@/hooks/usePreventiveMaintenance';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';
import type { ChecklistItemTemplate, PMScheduleTemplateItem } from '@/types/checklistTemplate';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for work schedule form - assets are OPTIONAL
const workScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  frequency_unit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()), // No .min(1) - assets are optional
  assigned_to: z.string().optional(),
  is_active: z.boolean(),
});

interface WorkScheduleFormProps {
  onSubmit: (data: PMScheduleFormData, templateItemIds: string[]) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Partial<PMScheduleFormData>;
  initialTemplateItems?: PMScheduleTemplateItem[];
}

export const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  initialData,
  initialTemplateItems = [],
}) => {
  const { data: users = [] } = useUsers();
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [selectedTemplateItems, setSelectedTemplateItems] = React.useState<PMScheduleTemplateItem[]>(initialTemplateItems);
  const [checklistError, setChecklistError] = React.useState<string>('');
  
  const form = useForm<Omit<PMScheduleFormData, 'checklist_items'>>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      instructions: initialData?.instructions || '',
      frequency_type: initialData?.frequency_type || 'monthly',
      frequency_value: initialData?.frequency_value || 1,
      frequency_unit: initialData?.frequency_unit || 'months',
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
      pm_schedule_id: '',
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

        <FrequencyControl
          value={{
            frequency_type: form.watch('frequency_type'),
            frequency_value: form.watch('frequency_value'),
            frequency_unit: form.watch('frequency_unit'),
          }}
          onChange={(value: FrequencyValue) => {
            form.setValue('frequency_type', value.frequency_type);
            form.setValue('frequency_value', value.frequency_value);
            form.setValue('frequency_unit', value.frequency_unit);
          }}
          error={form.formState.errors.frequency_type?.message || 
                 form.formState.errors.frequency_value?.message ||
                 form.formState.errors.frequency_unit?.message}
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
            Select Assets for this Schedule (Optional)
          </label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            You can assign assets later. Leave empty to create a template.
          </p>
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
