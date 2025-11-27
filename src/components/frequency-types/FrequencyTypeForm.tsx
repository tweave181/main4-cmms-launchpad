import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCreateFrequencyType, useUpdateFrequencyType } from '@/hooks/useFrequencyTypes';
import type { FrequencyType } from '@/hooks/useFrequencyTypes';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sort_order: z.number().min(0, 'Sort order must be a positive number'),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface FrequencyTypeFormProps {
  open: boolean;
  onClose: () => void;
  editingType?: FrequencyType;
}

export const FrequencyTypeForm: React.FC<FrequencyTypeFormProps> = ({
  open,
  onClose,
  editingType,
}) => {
  const createFrequencyType = useCreateFrequencyType();
  const updateFrequencyType = useUpdateFrequencyType();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (editingType) {
      form.reset({
        name: editingType.name,
        description: editingType.description || '',
        sort_order: editingType.sort_order,
        is_active: editingType.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        sort_order: 0,
        is_active: true,
      });
    }
  }, [editingType, form]);

  const onSubmit = (data: FormData) => {
    // The form data has been validated by Zod, so we know name, sort_order, and is_active are present
    const submissionData = {
      name: data.name,
      description: data.description,
      sort_order: data.sort_order,
      is_active: data.is_active,
    };
    
    if (editingType) {
      updateFrequencyType.mutate(
        { id: editingType.id, data: submissionData },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      createFrequencyType.mutate(submissionData, {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingType ? 'Edit Frequency Type' : 'Add Frequency Type'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly, Monthly, Quarterly" {...field} />
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
                      placeholder="Optional description"
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
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
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
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this frequency type available for selection
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFrequencyType.isPending || updateFrequencyType.isPending}
              >
                {createFrequencyType.isPending || updateFrequencyType.isPending
                  ? 'Saving...'
                  : editingType
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
