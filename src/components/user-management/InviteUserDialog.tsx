
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogTrigger,
} from '@/components/ui/form-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInvitation } from '@/hooks/mutations/useCreateInvitation';
import { useFormDialog } from '@/hooks/useFormDialog';
import { handleError, showSuccessToast } from '@/utils/errorHandling';

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'manager', 'technician', 'contractor'], {
    required_error: 'Please select a role',
  }),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

export const InviteUserDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const createInvitationMutation = useCreateInvitation();

  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose: () => setOpen(false),
  });

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'technician',
    },
  });

  const onSubmit = async (data: InviteUserFormData) => {
    try {
      await createInvitationMutation.mutateAsync({
        email: data.email,
        role: data.role,
      });
      showSuccessToast("Invitation sent successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      handleError(error, 'InviteUserDialog', {
        showToast: true,
        toastTitle: 'Invitation Failed',
        additionalData: { email: data.email, role: data.role }
      });
    }
  };

  const handleFormCancel = () => {
    handleCancel();
  };

  return (
    <>
      <FormDialog open={open} onOpenChange={() => {}}>
        <FormDialogTrigger asChild>
          <Button className="flex items-center space-x-2" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span>Invite User</span>
          </Button>
        </FormDialogTrigger>
        <FormDialogContent className="sm:max-w-[425px]">
          <FormDialogHeader>
            <FormDialogTitle>Invite New User</FormDialogTitle>
          </FormDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="user@example.com" 
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-start space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInvitationMutation.isPending}
                >
                  {createInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Form>
        </FormDialogContent>
      </FormDialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleGoBack}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
};
