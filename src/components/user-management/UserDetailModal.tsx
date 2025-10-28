import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit2, Trash2, User, Mail, Phone, Calendar, Building, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';
import { useDepartments } from '@/hooks/useDepartments';
import { useJobTitles } from '@/hooks/queries/useJobTitles';
import { UserRoleBadge } from './UserRoleBadge';
import { UserEmploymentBadge } from './UserEmploymentBadge';
import { UserTimeRecordsList } from '../time-records/UserTimeRecordsList';
import { userFormSchema, type UserFormData } from './userFormSchema';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'] & {
  departments?: { id: string; name: string } | null;
  job_titles?: { id: string; title_name: string } | null;
};

interface UserDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  isUpdating: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleStatus,
  isUpdating,
}) => {
  const { isAdmin } = useAuth();
  const { formatDate, formatDateTime } = useGlobalSettings();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { departments } = useDepartments();
  const { data: jobTitles } = useJobTitles();
  const updateUserMutation = useUpdateUser();
  
  const isEdit = mode === 'edit';

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      role: user.role as UserFormData['role'],
      employment_status: user.employment_status as UserFormData['employment_status'],
      department_id: user.department_id || undefined,
      job_title_id: user.job_title_id || undefined,
      phone_number: user.phone_number || undefined,
      status: user.status as UserFormData['status'],
    },
  });

  const { isDirty, isValid } = form.formState;

  // Reset form when user changes or when switching to view mode
  useEffect(() => {
    if (!isEdit) {
      form.reset({
        name: user.name || '',
        email: user.email,
        role: user.role as UserFormData['role'],
        employment_status: user.employment_status as UserFormData['employment_status'],
        department_id: user.department_id || undefined,
        job_title_id: user.job_title_id || undefined,
        phone_number: user.phone_number || undefined,
        status: user.status as UserFormData['status'],
      });
    }
  }, [user, isEdit, form]);

  const handleToggleStatus = () => {
    onToggleStatus(user.id, user.status);
  };

  const handleEdit = () => {
    if (isAdmin) {
      setMode('edit');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmation(true);
    } else {
      setMode('view');
    }
  };

  const handleConfirmCancel = () => {
    form.reset();
    setMode('view');
    setShowConfirmation(false);
  };

  const handleSave = async (data: UserFormData) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        updates: data,
      });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setMode('view');
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (isEdit && isDirty) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background border-b pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Record for:</p>
                <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  {user.name || user.email}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {isEdit ? (
                  <>
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={form.handleSubmit(handleSave)}
                      disabled={!isValid || updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit User
                      </Button>
                    )}
                    {isAdmin && (
                      <Button 
                        onClick={handleToggleStatus} 
                        disabled={isUpdating}
                        variant={user.status === 'active' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="time-records" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Records
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Form {...form}>
                <div className="space-y-6">
                  {/* Status and Role Badges */}
                  {!isEdit && (
                    <div className="flex flex-wrap gap-3">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <UserRoleBadge role={user.role} />
                      <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
                    </div>
                  )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEdit}
                            className={!isEdit ? "border-none bg-transparent p-0" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        {isEdit ? (
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                            />
                          </FormControl>
                        ) : (
                          <a 
                            href={`mailto:${field.value}`}
                            className="text-sm text-primary hover:underline block"
                          >
                            {field.value}
                          </a>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={!isEdit ? '-' : 'Enter phone number'}
                            disabled={!isEdit}
                            className={!isEdit ? "border-none bg-transparent p-0" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        {isEdit ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No department</SelectItem>
                              {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id}>
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {user.departments?.name || 'No department'}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="job_title_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        {isEdit ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No job title</SelectItem>
                              {jobTitles?.map((jobTitle) => (
                                <SelectItem key={jobTitle.id} value={jobTitle.id}>
                                  {jobTitle.title_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {user.job_titles?.title_name || 'No job title'}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        {isEdit ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full Time">Full Time</SelectItem>
                              <SelectItem value="Part Time">Part Time</SelectItem>
                              <SelectItem value="Bank Staff">Bank Staff</SelectItem>
                              <SelectItem value="Contractor">Contractor</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        {isEdit ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="technician">Technician</SelectItem>
                              <SelectItem value="contractor">Contractor</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <UserRoleBadge role={user.role} />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Activity Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Activity Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {user.last_login 
                        ? formatDateTime(user.last_login)
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

                  {/* Record Information */}
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span>Record Information</span>
                      <span>Created At: {formatDate(user.created_at)}</span>
                      <span>Last Updated: {formatDate(user.updated_at)}</span>
                    </span>
                  </div>
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="time-records" className="mt-6">
              <UserTimeRecordsList userId={user.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
};