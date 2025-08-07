import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCreateLocationLevel, useUpdateLocationLevel } from '@/hooks/useLocationLevels';
import type { LocationLevel, LocationLevelFormData } from '@/types/location';

const locationLevelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  code: z.string().max(10, 'Code too long').optional(),
  is_active: z.boolean().optional(),
});

interface LocationLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  locationLevel?: LocationLevel;
}

export const LocationLevelForm: React.FC<LocationLevelFormProps> = ({
  isOpen,
  onClose,
  locationLevel,
}) => {
  const createLocationLevel = useCreateLocationLevel();
  const updateLocationLevel = useUpdateLocationLevel();

  const form = useForm<LocationLevelFormData>({
    resolver: zodResolver(locationLevelSchema),
    defaultValues: {
      name: locationLevel?.name || '',
      code: locationLevel?.code || '',
      is_active: locationLevel?.is_active ?? true,
    },
  });

  const onSubmit = async (data: LocationLevelFormData) => {
    try {
      const cleanedData = {
        ...data,
        code: data.code === '' ? undefined : data.code,
      };

      if (locationLevel) {
        await updateLocationLevel.mutateAsync({ id: locationLevel.id, data: cleanedData });
      } else {
        await createLocationLevel.mutateAsync(cleanedData);
      }
      onClose();
      form.reset();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {locationLevel ? 'Edit Location Level' : 'Create Location Level'}
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
                    <Input placeholder="e.g. Building, Floor, Room" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. BLD, FLR, RM"
                      {...field}
                      style={{ textTransform: 'uppercase' }}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Short code for identification
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Available for use in location creation
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

            <div className="flex justify-start space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLocationLevel.isPending || updateLocationLevel.isPending}
              >
                {locationLevel ? 'Update' : 'Create'} Level
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};