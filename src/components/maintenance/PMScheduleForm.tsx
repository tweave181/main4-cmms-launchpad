
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
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

const pmScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  frequency_unit: z.enum(['days', 'weeks', 'months']).optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()).min(1, 'At least one asset must be selected'),
  is_active: z.boolean(),
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
      is_active: initialData?.is_active ?? true,
    },
  });

  const frequencyType = form.watch('frequency_type');

  const handleSubmit = (data: PMScheduleFormData) => {
    console.log('PM Schedule form data:', data);
    onSubmit(data);
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
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="frequency_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Value *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {frequencyType === 'custom' && (
            <FormField
              control={form.control}
              name="frequency_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Unit *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
