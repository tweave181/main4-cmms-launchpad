import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Wrench, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  User, 
  Save,
  X,
  Plus,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  usePMSchedule, 
  useDeletePMSchedule, 
  useCreatePMSchedule, 
  useUpdatePMSchedule,
  useUsers 
} from '@/hooks/usePreventiveMaintenance';
import { FrequencyControl, type FrequencyValue } from '@/components/maintenance/FrequencyControl';
import { PMChecklistEditor } from '@/components/maintenance/PMChecklistEditor';
import { AssetSingleSelector } from '@/components/maintenance/AssetSingleSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

const pmScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  frequency_unit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  next_due_date: z.string().min(1, 'Next due date is required'),
  asset_ids: z.array(z.string()).min(1, 'At least one asset must be selected'),
  assigned_to: z.string().optional(),
  is_active: z.boolean(),
  checklist_items: z.array(z.object({
    item_text: z.string().min(1, 'Item text is required'),
    item_type: z.enum(['checkbox', 'value']),
    sort_order: z.number(),
  })).optional(),
});

type FormData = z.infer<typeof pmScheduleSchema>;

type ViewMode = 'view' | 'edit' | 'create';

const PMScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === 'new';
  
  // Determine initial mode
  const [mode, setMode] = useState<ViewMode>(isNew ? 'create' : 'view');
  
  // API hooks
  const { data: schedule, isLoading, error } = usePMSchedule(isNew ? undefined : id!);
  const { data: users = [] } = useUsers();
  const deleteMutation = useDeletePMSchedule();
  const createMutation = useCreatePMSchedule();
  const updateMutation = useUpdatePMSchedule();
  
  // Asset selector state
  const [assetSelectorOpen, setAssetSelectorOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{id: string; name: string; asset_tag?: string} | null>(null);

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(pmScheduleSchema),
    defaultValues: {
      name: '',
      description: '',
      instructions: '',
      frequency_type: 'monthly',
      frequency_value: 1,
      frequency_unit: 'months',
      next_due_date: '',
      asset_ids: [],
      assigned_to: '',
      is_active: true,
      checklist_items: [],
    },
  });

  const { formState: { isDirty } } = form;

  // Unsaved changes protection
  useBeforeUnload(
    React.useCallback((event) => {
      if ((mode === 'edit' || mode === 'create') && isDirty) {
        event.preventDefault();
        return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
      }
    }, [mode, isDirty])
  );

  // Load data into form when schedule is available
  useEffect(() => {
    if (schedule && !isNew) {
      const assetIds = schedule.assets?.map(a => a.id) || [];
      form.reset({
        name: schedule.name,
        description: schedule.description || '',
        instructions: schedule.instructions || '',
        frequency_type: schedule.frequency_type,
        frequency_value: schedule.frequency_value,
        frequency_unit: schedule.frequency_unit,
        next_due_date: schedule.next_due_date,
        asset_ids: assetIds,
        assigned_to: schedule.assigned_to || '',
        is_active: schedule.is_active,
        checklist_items: schedule.checklist_items?.map(item => ({
          item_text: item.item_text,
          item_type: item.item_type,
          sort_order: item.sort_order,
        })) || [],
      });
      
      // Set selected asset for display
      if (schedule.assets && schedule.assets.length > 0) {
        setSelectedAsset(schedule.assets[0]);
      }
    }
  }, [schedule, form, isNew]);

  // Utility functions
  const getFrequencyText = (formData: FormData) => {
    const type = formData.frequency_type;
    const value = formData.frequency_value;
    
    // Handle preset mappings for display
    if (type === 'weekly' && value === 4) return 'Four Weekly';
    if (type === 'monthly' && value === 6) return 'Six Monthly';
    if (type === 'yearly' && value === 2) return 'Two Yearly';
    if (type === 'monthly' && value === 3) return 'Quarterly';
    
    // Handle standard frequencies  
    if (value === 1) {
      switch (type) {
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'monthly': return 'Monthly';
        case 'yearly': return 'Yearly';
        default: return 'Custom';
      }
    }
    
    // Handle custom frequencies
    if (type === 'custom') {
      return `Every ${value} ${formData.frequency_unit}`;
    }
    
    // Handle other multi-value frequencies
    const unit = type === 'daily' ? 'days' : 
                type === 'weekly' ? 'weeks' : 
                type === 'monthly' ? 'months' : 
                type === 'yearly' ? 'years' : 'units';
    
    return `Every ${value} ${unit}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return {
        variant: 'destructive' as const,
        text: `${Math.abs(daysUntilDue)} days overdue`
      };
    }
    if (daysUntilDue <= 14) {
      return {
        variant: 'default' as const,
        text: daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`
      };
    }
    return {
      variant: 'outline' as const,
      text: 'On track'
    };
  };

  // Event handlers
  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    if (mode === 'create') {
      navigate('/maintenance');
    } else {
      form.reset();
      setMode('view');
    }
  };

  const handleSave = (data: FormData) => {
    // Transform data to match PMScheduleFormData
    const pmData: PMScheduleFormData = {
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      frequency_type: data.frequency_type,
      frequency_value: data.frequency_value,
      frequency_unit: data.frequency_unit,
      next_due_date: data.next_due_date,
      asset_ids: data.asset_ids,
      assigned_to: data.assigned_to === 'unassigned' ? '' : data.assigned_to,
      is_active: data.is_active,
      checklist_items: (data.checklist_items || []).filter(item => 
        item.item_text && item.item_text.trim().length > 0
      ).map(item => ({
        item_text: item.item_text!,
        item_type: item.item_type!,
        sort_order: item.sort_order!,
      })),
    };

    if (mode === 'create') {
      createMutation.mutate(pmData, {
        onSuccess: (newSchedule) => {
          toast({
            title: "Success",
            description: "Preventive maintenance schedule created successfully",
          });
          navigate(`/pm/${newSchedule.id}`);
          setMode('view');
        }
      });
    } else {
      updateMutation.mutate({ id: id!, data: pmData }, {
        onSuccess: () => {
          toast({
            title: "Success", 
            description: "Preventive maintenance schedule updated successfully",
          });
          setMode('view');
        }
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        toast({
          title: "Schedule deleted",
          description: "The PM schedule has been deleted successfully.",
        });
        navigate('/maintenance');
      }
    });
  };

  const handleAssetSelect = (asset: {id: string; name: string; asset_tag?: string}) => {
    setSelectedAsset(asset);
    form.setValue('asset_ids', [asset.id], { shouldDirty: true });
  };

  const handleAssetClear = () => {
    setSelectedAsset(null);
    form.setValue('asset_ids', [], { shouldDirty: true });
  };

  // Loading state
  if (isLoading && !isNew) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not found state
  if (!schedule && !isNew && !isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">Schedule not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested PM schedule could not be found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/maintenance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Maintenance
          </Button>
        </div>
      </div>
    );
  }

  const formData = form.watch();
  const daysUntilDue = formData.next_due_date ? getDaysUntilDue(formData.next_due_date) : 0;
  const statusBadge = formData.next_due_date ? getStatusBadge(daysUntilDue) : null;

  return (
    <>
      <div className="p-6 space-y-6">{/* ... rest of content ... */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/maintenance')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <Wrench className="h-6 w-6 text-primary" />
                {mode === 'view' ? (
                  <h1 className="text-2xl font-semibold flex items-center space-x-3">
                    <span>{formData.name || 'Untitled Schedule'}</span>
                    {!formData.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </h1>
                ) : (
                  <div className="flex-1">
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter schedule name"
                                className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </Form>
                  </div>
                )}
              </div>
              {statusBadge && (
                <Badge variant={statusBadge.variant} className="mt-2">
                  {statusBadge.text}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action buttons based on mode */}
          <div className="flex items-center space-x-2">
            {mode === 'view' && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete PM Schedule</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
            {(mode === 'edit' || mode === 'create') && (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Discard' : 'Cancel'}
                </Button>
                <Button 
                  onClick={form.handleSubmit(handleSave)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Schedule Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mode === 'view' ? (
                      // View mode content
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Next Due Date</p>
                            <p className="text-sm text-muted-foreground">
                              {formData.next_due_date ? format(new Date(formData.next_due_date), 'EEEE, MMMM dd, yyyy') : 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Frequency</p>
                            <p className="text-sm text-muted-foreground">
                              {getFrequencyText(formData)}
                            </p>
                          </div>
                        </div>

                        {formData.assigned_to && (
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Assigned To</p>
                              <p className="text-sm text-muted-foreground">
                                {users.find(u => u.id === formData.assigned_to)?.name || 'Unknown User'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Edit/Create mode content
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="next_due_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Next Due Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FrequencyControl
                          value={{
                            frequency_type: form.watch('frequency_type'),
                            frequency_value: form.watch('frequency_value'),
                            frequency_unit: form.watch('frequency_unit'),
                          }}
                          onChange={(value: FrequencyValue) => {
                            form.setValue('frequency_type', value.frequency_type, { shouldDirty: true });
                            form.setValue('frequency_value', value.frequency_value, { shouldDirty: true });
                            form.setValue('frequency_unit', value.frequency_unit, { shouldDirty: true });
                          }}
                          error={form.formState.errors.frequency_type?.message || 
                                 form.formState.errors.frequency_value?.message ||
                                 form.formState.errors.frequency_unit?.message}
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
                      </div>
                    )}

                    {/* Description and Instructions */}
                    {(formData.description || mode !== 'view') && (
                      <>
                        <Separator />
                        {mode === 'view' ? (
                          formData.description && (
                            <div>
                              <p className="text-sm font-medium mb-2">Description</p>
                              <p className="text-sm text-muted-foreground">
                                {formData.description}
                              </p>
                            </div>
                          )
                        ) : (
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
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}

                    {(formData.instructions || mode !== 'view') && (
                      <>
                        <Separator />
                        {mode === 'view' ? (
                          formData.instructions && (
                            <div>
                              <p className="text-sm font-medium mb-2">Instructions</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {formData.instructions}
                              </p>
                            </div>
                          )
                        ) : (
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
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Checklist Items */}
                {mode === 'view' ? (
                  formData.checklist_items && formData.checklist_items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Checklist Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {formData.checklist_items.map((item, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{item.item_text}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {item.item_type === 'checkbox' ? 'Checkbox' : 'Value Entry'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <FormField
                    control={form.control}
                    name="checklist_items"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PMChecklistEditor
                            items={(field.value || []).map(item => ({
                              item_text: item.item_text || '',
                              item_type: item.item_type || 'checkbox',
                              sort_order: item.sort_order || 0,
                            }))}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Assigned Asset */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Asset (1)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mode === 'view' ? (
                      selectedAsset ? (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm flex items-center">
                                {selectedAsset.name}
                                <ExternalLink 
                                  className="h-3 w-3 ml-2 cursor-pointer text-muted-foreground hover:text-foreground" 
                                  onClick={() => window.open(`/assets/${selectedAsset.id}`, '_blank')}
                                />
                              </p>
                              {selectedAsset.asset_tag && (
                                <p className="text-xs text-muted-foreground">
                                  Tag: {selectedAsset.asset_tag}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No asset assigned</p>
                      )
                    ) : (
                      <div className="space-y-3">
                        {selectedAsset ? (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{selectedAsset.name}</p>
                                {selectedAsset.asset_tag && (
                                  <p className="text-xs text-muted-foreground">
                                    Tag: {selectedAsset.asset_tag}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssetSelectorOpen(true)}
                                >
                                  Change
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAssetClear}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAssetSelectorOpen(true)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Select Asset
                          </Button>
                        )}
                        <FormField
                          control={form.control}
                          name="asset_ids"
                          render={() => (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status Alert */}
                {statusBadge && daysUntilDue <= 14 && formData.is_active && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">Attention Required</p>
                          <p className="text-xs">
                            {daysUntilDue < 0 
                              ? 'This maintenance is overdue'
                              : 'This maintenance is due soon'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Asset Selector Modal */}
      <AssetSingleSelector
        isOpen={assetSelectorOpen}
        onClose={() => setAssetSelectorOpen(false)}
        onSelect={handleAssetSelect}
        selectedAssetId={selectedAsset?.id}
      />
    </>
  );
};

export default PMScheduleDetail;