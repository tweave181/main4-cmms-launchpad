import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateTimeRecord } from '@/hooks/useTimeRecords';
import { useAuth } from '@/contexts/auth';
import { useUsers } from '@/hooks/queries/useUsers';
import type { TimeRecordFormData } from '@/types/timeRecord';

const timeRecordSchema = z.object({
  work_date: z.string().min(1, 'Date is required'),
  hours_worked: z.string()
    .min(1, 'Hours worked is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 24;
    }, 'Hours must be between 0 and 24'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  work_type: z.string().optional(),
  user_id: z.string().uuid().optional(),  // Admin only
});

interface AddTimeRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId?: string;
  pmScheduleId?: string;
  maintenanceJobId?: string;
  assetId?: string;
}

export const AddTimeRecordModal: React.FC<AddTimeRecordModalProps> = ({
  open,
  onOpenChange,
  workOrderId,
  pmScheduleId,
  maintenanceJobId,
  assetId,
}) => {
  const { userProfile } = useAuth();
  const createMutation = useCreateTimeRecord();
  const { data: users = [] } = useUsers();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  // Filter active users who are available for time tracking
  const activeUsers = users.filter(u => u.status === 'active' && u.available_for_time_tracking === true);

  const form = useForm<z.infer<typeof timeRecordSchema>>({
    resolver: zodResolver(timeRecordSchema),
    defaultValues: {
      work_date: format(new Date(), 'yyyy-MM-dd'),
      hours_worked: '',
      start_time: '',
      end_time: '',
      description: '',
      work_type: '',
      user_id: userProfile?.id || '',
    },
  });

  const selectedUserId = form.watch('user_id');
  const selectedUser = activeUsers.find(u => u.id === selectedUserId);
  const isLoggingForOther = isAdmin && selectedUserId !== userProfile?.id;

  const onSubmit = async (data: z.infer<typeof timeRecordSchema>) => {
    const formData: TimeRecordFormData & { user_id_override?: string } = {
      work_date: data.work_date,
      hours_worked: data.hours_worked,
      start_time: data.start_time,
      end_time: data.end_time,
      description: data.description,
      work_type: data.work_type,
      work_order_id: workOrderId,
      pm_schedule_id: pmScheduleId,
      maintenance_job_id: maintenanceJobId,
      asset_id: assetId,
    };

    // Add user_id_override if admin is logging for someone else
    if (isAdmin && data.user_id && data.user_id !== userProfile?.id) {
      formData.user_id_override = data.user_id;
    }

    await createMutation.mutateAsync(formData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Selector (Admin Only) */}
            {isAdmin && (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Logging Time For
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={userProfile?.id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                            {user.id === userProfile?.id && ' (You)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select which user this time record is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Admin Warning */}
            {isLoggingForOther && (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  You are logging time for: <strong>{selectedUser?.name || selectedUser?.email}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Non-Admin User Display */}
            {!isAdmin && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Logging time for:</p>
                <p className="font-medium">{userProfile?.name || userProfile?.email}</p>
              </div>
            )}

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="work_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hours Worked */}
            <FormField
              control={form.control}
              name="hours_worked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Worked</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="24"
                      placeholder="e.g., 3.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Time (Optional) */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time (Optional) */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Type */}
            <FormField
              control={form.control}
              name="work_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work performed..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Log Time'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
