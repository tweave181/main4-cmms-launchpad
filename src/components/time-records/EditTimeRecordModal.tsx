import React, { useState, useEffect } from 'react';
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
import { useUpdateTimeRecord } from '@/hooks/useTimeRecords';
import { useAuth } from '@/contexts/auth';
import { useUsers } from '@/hooks/queries/useUsers';
import type { TimeRecord } from '@/types/timeRecord';

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
  user_id: z.string().uuid().optional(),  // Admin can reassign
});

interface EditTimeRecordModalProps {
  timeRecord: TimeRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTimeRecordModal: React.FC<EditTimeRecordModalProps> = ({
  timeRecord,
  open,
  onOpenChange,
}) => {
  const { userProfile } = useAuth();
  const updateMutation = useUpdateTimeRecord();
  const { data: users = [] } = useUsers();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  const activeUsers = users.filter(u => u.status === 'active');

  const form = useForm<z.infer<typeof timeRecordSchema>>({
    resolver: zodResolver(timeRecordSchema),
    defaultValues: {
      work_date: timeRecord.work_date,
      hours_worked: String(timeRecord.hours_worked),
      start_time: timeRecord.start_time || '',
      end_time: timeRecord.end_time || '',
      description: timeRecord.description,
      work_type: timeRecord.work_type || '',
      user_id: timeRecord.user_id,
    },
  });

  // Reset form when timeRecord changes
  useEffect(() => {
    form.reset({
      work_date: timeRecord.work_date,
      hours_worked: String(timeRecord.hours_worked),
      start_time: timeRecord.start_time || '',
      end_time: timeRecord.end_time || '',
      description: timeRecord.description,
      work_type: timeRecord.work_type || '',
      user_id: timeRecord.user_id,
    });
  }, [timeRecord, form]);

  const selectedUserId = form.watch('user_id');
  const selectedUser = activeUsers.find(u => u.id === selectedUserId);
  const originalUser = timeRecord.user;
  const isReassigning = isAdmin && selectedUserId !== timeRecord.user_id;

  const onSubmit = async (data: z.infer<typeof timeRecordSchema>) => {
    await updateMutation.mutateAsync({
      id: timeRecord.id,
      data,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Time Record</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Display/Selector */}
            {isAdmin ? (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Time Record For
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
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
                      Admins can reassign time records to different users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Time record for:</p>
                <p className="font-medium">{originalUser?.name || originalUser?.email || 'Unknown User'}</p>
              </div>
            )}

            {/* Admin Reassignment Warning */}
            {isReassigning && (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Reassigning from <strong>{originalUser?.name}</strong> to <strong>{selectedUser?.name}</strong>
                </AlertDescription>
              </Alert>
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
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
