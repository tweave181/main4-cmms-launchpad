import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const contractSchema = z.object({
  contract_title: z.string().min(1, 'Contract title is required'),
  vendor_company_id: z.string().min(1, 'Vendor company is required'),
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
  assetId?: string; // For linking to a specific asset
}

export const ServiceContractModal: React.FC<ServiceContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  assetId
}) => {
  const { userProfile } = useAuth();
  const { currency } = useGlobalSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('company_details')
        .select(`
          id, 
          company_name, 
          email, 
          phone, 
          company_address_id,
          company_address:addresses(*)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('company_name');

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

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
      visit_count: undefined,
      vendor_company_id: ''
    }
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const emailReminderEnabled = watch('email_reminder_enabled');
  const selectedVendorId = watch('vendor_company_id');

  const selectedCompany = companies.find(c => c.id === selectedVendorId);

  const [companySearchOpen, setCompanySearchOpen] = React.useState(false);

  const createContractMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const selectedCompany = companies.find(c => c.id === data.vendor_company_id);
      if (!selectedCompany) {
        throw new Error('Selected vendor not found');
      }

      const contractData = {
        contract_title: data.contract_title,
        vendor_name: selectedCompany.company_name,
        vendor_company_id: data.vendor_company_id,
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

      // If assetId is provided, link the asset to this contract
      if (assetId) {
        const { error: assetError } = await supabase
          .from('assets')
          .update({ service_contract_id: result.id })
          .eq('id', assetId);

        if (assetError) throw assetError;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-contracts'] });
      if (assetId) {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      }
      toast({
        title: 'Success',
        description: assetId 
          ? 'Service contract created and linked to asset successfully'
          : 'Service contract created successfully',
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
            {assetId && ' (Link to Asset)'}
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
              <Label htmlFor="vendor_company_id">Vendor Company *</Label>
              <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companySearchOpen}
                    className="w-full justify-between"
                    disabled={companiesLoading}
                  >
                    {selectedVendorId
                      ? companies.find((company) => company.id === selectedVendorId)?.company_name
                      : "Select vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search vendors..." />
                    <CommandList>
                      <CommandEmpty>No vendors found.</CommandEmpty>
                      <CommandGroup>
                        {companies.map((company) => (
                          <CommandItem
                            key={company.id}
                            value={company.company_name}
                            onSelect={() => {
                              setValue('vendor_company_id', company.id);
                              setCompanySearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedVendorId === company.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {company.company_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.vendor_company_id && (
                <p className="text-sm text-destructive">{errors.vendor_company_id.message}</p>
              )}
            </div>
          </div>

          {/* Company Preview Card */}
          {selectedCompany && (
            <Card className="border-muted-foreground/20 bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-muted-foreground">Vendor Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <p className="text-sm text-foreground mt-1">{selectedCompany.company_name}</p>
                  </div>
                  {selectedCompany.email && (
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-foreground mt-1">{selectedCompany.email}</p>
                    </div>
                  )}
                  {selectedCompany.phone && (
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-foreground mt-1">{selectedCompany.phone}</p>
                    </div>
                  )}
                  {selectedCompany.company_address && (
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-foreground mt-1">
                        {[
                          selectedCompany.company_address.address_line_1,
                          selectedCompany.company_address.address_line_2,
                          selectedCompany.company_address.town_or_city,
                          selectedCompany.company_address.county_or_state,
                          selectedCompany.company_address.postcode
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                    className="p-3 pointer-events-auto"
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
                    className="p-3 pointer-events-auto"
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
              <Label htmlFor="contract_cost">Contract Cost ({currency})</Label>
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
          <div className="flex justify-start space-x-2 pt-4">
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
