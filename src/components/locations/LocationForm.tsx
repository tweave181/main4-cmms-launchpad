import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logError } from '@/utils/errorHandling';
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
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useCreateLocation, useUpdateLocation, useLocations } from '@/hooks/useLocations';
import { useLocationLevels } from '@/hooks/useLocationLevels';
import type { Location, LocationFormData } from '@/types/location';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100, 'Name too long'),
  location_code: z.string()
    .min(2, 'Location code must be at least 2 characters')
    .max(5, 'Location code must be at most 5 characters')
    .regex(/^[A-Z]+$/, 'Location code must contain only uppercase letters')
    .optional(),
  description: z.string().max(500, 'Description too long').optional(),
  parent_location_id: z.string().optional().or(z.literal('none')),
  location_level_id: z.string().min(1, 'Location level is required'),
});

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const { data: allLocations = [] } = useLocations();
  const { data: locationLevels = [] } = useLocationLevels({ is_active: true });

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      location_code: location?.location_code || '',
      description: location?.description || '',
      parent_location_id: location?.parent_location_id || 'none',
      location_level_id: location?.location_level_id || '',
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    try {
      // Clean up data before submission
      const cleanedData = {
        ...data,
        parent_location_id: data.parent_location_id === 'none' || data.parent_location_id === '' ? undefined : data.parent_location_id,
        description: data.description === '' ? undefined : data.description,
        location_code: data.location_code === '' ? undefined : data.location_code,
      };

      if (location) {
        await updateLocation.mutateAsync({ id: location.id, data: cleanedData });
      } else {
        await createLocation.mutateAsync(cleanedData);
      }
      onClose();
      form.reset();
    } catch (error) {
      logError(error, 'LocationForm', { locationId: location?.id, isUpdate: !!location });
      // Error toast is shown by the hooks
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
            {location ? 'Edit Location' : 'Create Location'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter location name" 
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

            {isAdmin && (
              <FormField
                control={form.control}
                name="location_code"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Location Code</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Location Code is used in Work Order Numbers. Must be unique.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="Auto-generated from name" 
                        {...field}
                        style={{ textTransform: 'uppercase' }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to auto-generate from location name
                    </p>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="parent_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Location or Site (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent location (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {allLocations
                        .filter(loc => loc.id !== location?.id) // Don't allow self-reference
                        .map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name} ({loc.location_code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_level_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Level *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      {locationLevels.length === 0 ? (
                        <SelectItem value="" disabled>
                          No location levels available - Contact admin
                        </SelectItem>
                      ) : (
                        locationLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name} {level.code && `(${level.code})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter location description"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-start space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLocation.isPending || updateLocation.isPending}
              >
                {location ? 'Update' : 'Create'} Location
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};