
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PMAssetSelector } from './PMAssetSelector';
import type { PMScheduleFormData, PreventiveMaintenanceSchedule } from '@/types/preventiveMaintenance';

const pmScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  frequency_unit: z.enum(['days', 'weeks', 'months']).optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()),
  is_active: z.boolean(),
});

interface PMScheduleFormProps {
  schedule?: PreventiveMaintenanceSchedule;
  onSubmit: (data: PMScheduleFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PMScheduleForm: React.FC<PMScheduleFormProps> = ({
  schedule,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const form = useForm<PMScheduleFormData>({
    resolver: zodResolver(pmScheduleSchema),
    defaultValues: {
      name: schedule?.name || '',
      description: schedule?.description || '',
      instructions: schedule?.instructions || '',
      frequency_type: schedule?.frequency_type || 'monthly',
      frequency_value: schedule?.frequency_value || 1,
      frequency_unit: schedule?.frequency_unit || 'months',
      next_due_date: schedule?.next_due_date || '',
      asset_ids: [],
      is_active: schedule?.is_active ?? true,
    },
  });

  const frequencyType = form.watch('frequency_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter schedule name" {...field} />
              </FormControl>
              <FormMessage />
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
                  placeholder="Enter description"
                  className="resize-none"
                  {...field}
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
                  className="resize-none h-24"
                  {...field}
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
                <FormLabel>Frequency Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
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
                <FormLabel>Frequency Value</FormLabel>
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
                  <FormLabel>Frequency Unit</FormLabel>
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
              <FormLabel>Next Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="asset_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assets</FormLabel>
              <PMAssetSelector
                selectedAssetIds={field.value}
                onSelectionChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Schedule</FormLabel>
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : schedule ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
