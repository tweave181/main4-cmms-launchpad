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
import { useUsers } from '@/hooks/usePreventiveMaintenance';
import { useChecklistRecords } from '@/hooks/useChecklistRecords';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for work schedule form - assets are OPTIONAL
const workScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()), // No .min(1) - assets are optional
  assigned_to: z.string().optional(),
  checklist_record_id: z.string().min(1, 'Checklist record is required'),
  is_active: z.boolean(),
});

interface WorkScheduleFormProps {
  onSubmit: (data: PMScheduleFormData) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Partial<PMScheduleFormData>;
}

export const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  initialData,
}) => {
  const { data: users = [] } = useUsers();
  const { data: checklistRecords = [], isLoading: recordsLoading } = useChecklistRecords();
  
  const activeRecords = checklistRecords.filter(r => r.is_active);
  
  const form = useForm<PMScheduleFormData>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      instructions: initialData?.instructions || '',
      next_due_date: initialData?.next_due_date || '',
      asset_ids: initialData?.asset_ids || [],
      assigned_to: initialData?.assigned_to || '',
      checklist_record_id: initialData?.checklist_record_id || '',
      is_active: initialData?.is_active ?? true,
      frequency_type: 'monthly',
      frequency_value: 1,
      frequency_unit: 'months',
      checklist_items: [],
    },
  });

  const handleSubmit = (data: PMScheduleFormData) => {
    // Convert "unassigned" back to empty string for the API
    const submitData: PMScheduleFormData = {
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

        {/* Checklist Record Selection */}
        <FormField
          control={form.control}
          name="checklist_record_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist Record *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={recordsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={recordsLoading ? "Loading records..." : "Select a checklist record"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeRecords.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active checklist records available.</p>
                      <p className="text-xs mt-1">Create one first in Checklist Records.</p>
                    </div>
                  ) : (
                    activeRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        <div className="flex flex-col">
                          <span>{record.name}</span>
                          {(record.asset_type || record.frequency_type) && (
                            <span className="text-xs text-muted-foreground">
                              {[record.asset_type, record.frequency_type].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The checklist record defines what work should be done for this schedule
              </p>
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
