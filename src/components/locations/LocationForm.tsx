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
import { useCreateLocation, useUpdateLocation } from '@/hooks/useLocations';
import { useLocationLevels } from '@/hooks/useLocationLevels';
import { useDepartments } from '@/hooks/useDepartments';
import type { Location, LocationFormData } from '@/types/location';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  department_id: z.string().optional().or(z.literal('none')),
  location_level_id: z.string().min(1, 'Location level is required'),
});

// Generate location code from name (mirrors database function)
const generateLocationCode = (name: string): string => {
  if (!name.trim()) return '';
  
  const cleanName = name.toUpperCase();
  const lettersOnly = cleanName.replace(/[^A-Z]/g, '');
  const numbersOnly = cleanName.replace(/[^0-9]/g, '');
  
  // Take 2-3 letters depending on whether we have numbers
  let code = lettersOnly.slice(0, numbersOnly.length > 0 ? 2 : 3);
  
  // Ensure minimum 2 letters
  if (code.length < 2) {
    code = code.padEnd(2, 'X');
  }
  
  // Append numbers if present (limit to keep total ≤ 5 chars)
  if (numbersOnly.length > 0) {
    code += numbersOnly.slice(0, 5 - code.length);
  }
  
  return code;
};

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
  const { data: locationLevels = [] } = useLocationLevels({ is_active: true });
  const { departments } = useDepartments();
  
  // Preview code state for new locations
  const [previewCode, setPreviewCode] = React.useState('');

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      description: location?.description || '',
      department_id: location?.department_id || 'none',
      location_level_id: location?.location_level_id || '',
    },
  });
  
  // Initialize preview code when editing
  React.useEffect(() => {
    if (location?.name) {
      setPreviewCode(location.location_code || generateLocationCode(location.name));
    } else {
      setPreviewCode('');
    }
  }, [location]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      // Clean up data before submission - let database auto-generate location_code
      const cleanedData = {
        ...data,
        department_id: data.department_id === 'none' || data.department_id === '' ? undefined : data.department_id,
        description: data.description === '' ? undefined : data.description,
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
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        // Generate preview code when name changes (only for new locations)
                        if (!location) {
                          setPreviewCode(generateLocationCode(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Code - Read-only with auto-generation preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium leading-none">Location Code</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Location Code is used in Work Order Numbers. Auto-generated from name.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                value={location ? location.location_code : (previewCode || 'Will be auto-generated')}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                {location ? 'Location code cannot be changed' : 'Auto-generated from location name'}
              </p>
            </div>

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
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
