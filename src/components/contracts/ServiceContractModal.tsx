import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const contractSchema = z.object({
  contract_title: z.string().min(1, 'Contract title is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  description: z.string().optional(),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  contract_cost: z.number().min(0, 'Cost must be positive').optional(),
  status: z.enum(['Active', 'Expired', 'Terminated', 'Pending Review']),
  email_reminder_enabled: z.boolean(),
  reminder_days_before: z.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days').optional(),
  visit_count: z.number().min(0, 'Visit count must be positive').optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ServiceContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any; // For editing existing contracts
}

export const ServiceContractModal: React.FC<ServiceContractModalProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'Active',
      email_reminder_enabled: true,
      contract_cost: undefined,
      reminder_days_before: 30,
      visit_count: undefined
    }
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const emailReminderEnabled = watch('email_reminder_enabled');

  const createContractMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const contractData = {
        contract_title: data.contract_title,
        vendor_name: data.vendor_name,
        description: data.description || null,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date.toISOString().split('T')[0],
        status: data.status,
        email_reminder_enabled: data.email_reminder_enabled,
        tenant_id: userProfile.tenant_id,
        contract_cost: data.contract_cost || null,
        reminder_days_before: data.email_reminder_enabled ? data.reminder_days_before || null : null,
        visit_count: data.visit_count || null
      };

      const { data: result, error } = await supabase
        .from('service_contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-contracts'] });
      toast({
        title: 'Success',
        description: 'Service contract created successfully',
      });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contract',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: ContractFormData) => {
    // Validate that end date is after start date
    if (data.end_date <= data.start_date) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    createContractMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit Service Contract' : 'Add New Service Contract'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_title">Contract Title *</Label>
              <Input
                id="contract_title"
                {...register('contract_title')}
                placeholder="e.g., HVAC Maintenance Contract"
              />
              {errors.contract_title && (
                <p className="text-sm text-destructive">{errors.contract_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name *</Label>
              <Input
                id="vendor_name"
                {...register('vendor_name')}
                placeholder="e.g., ABC Maintenance Services"
              />
              {errors.vendor_name && (
                <p className="text-sm text-destructive">{errors.vendor_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the contract scope and services..."
              rows={3}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setValue('start_date', date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => setValue('end_date', date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_cost">Contract Cost ($)</Label>
              <Input
                id="contract_cost"
                type="number"
                step="0.01"
                min="0"
                {...register('contract_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.contract_cost && (
                <p className="text-sm text-destructive">{errors.contract_cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit_count">Number of Visits</Label>
              <Input
                id="visit_count"
                type="number"
                min="0"
                {...register('visit_count', { valueAsNumber: true })}
                placeholder="e.g., 12"
              />
              {errors.visit_count && (
                <p className="text-sm text-destructive">{errors.visit_count.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email Reminders */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="email_reminder_enabled"
                checked={emailReminderEnabled}
                onCheckedChange={(checked) => setValue('email_reminder_enabled', checked)}
              />
              <Label htmlFor="email_reminder_enabled">Enable email reminders</Label>
            </div>

            {emailReminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder_days_before">Send reminder (days before expiry)</Label>
                <Input
                  id="reminder_days_before"
                  type="number"
                  min="1"
                  max="365"
                  {...register('reminder_days_before', { valueAsNumber: true })}
                  placeholder="30"
                />
                {errors.reminder_days_before && (
                  <p className="text-sm text-destructive">{errors.reminder_days_before.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};