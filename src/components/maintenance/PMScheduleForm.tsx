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
import { PMChecklistEditor } from './PMChecklistEditor';
import { FrequencyControl, type FrequencyValue } from './FrequencyControl';
import { useUsers } from '@/hooks/usePreventiveMaintenance';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

const pmScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  frequency_unit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()).min(1, 'At least one asset must be selected'),
  assigned_to: z.string().optional(),
  is_active: z.boolean(),
  checklist_items: z.array(z.object({
    item_text: z.string().min(1, 'Item text is required'),
    item_type: z.enum(['checkbox', 'value']),
    sort_order: z.number(),
  })).optional(),
});

interface PMScheduleFormProps {
  onSubmit: (data: PMScheduleFormData) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Partial<PMScheduleFormData>;
}

export const PMScheduleForm: React.FC<PMScheduleFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  initialData,
}) => {
  const { data: users = [] } = useUsers();
  
  const form = useForm<PMScheduleFormData>({
    resolver: zodResolver(pmScheduleSchema),
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
      checklist_items: initialData?.checklist_items || [],
    },
  });

  const frequencyValue = form.watch(['frequency_type', 'frequency_value', 'frequency_unit']);

  const handleSubmit = (data: PMScheduleFormData) => {
    console.log('PM Schedule form data:', data);
    // Convert "unassigned" back to empty string for the API
    const submitData = {
      ...data,
      assigned_to: data.assigned_to === 'unassigned' ? '' : data.assigned_to,
    };
    onSubmit(submitData);
  };

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
                  <Input placeholder="Enter schedule name" {...field} />
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

        <FormField
          control={form.control}
          name="checklist_items"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PMChecklistEditor
                  items={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
