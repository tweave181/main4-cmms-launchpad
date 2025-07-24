
import React, { useState } from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogDescription,
  FormDialogTrigger,
} from '@/components/ui/form-dialog';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit } from 'lucide-react';
import { UserForm } from './UserForm';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';
import { useFormDialog } from '@/hooks/useFormDialog';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface EditUserDialogProps {
  user: User;
  trigger?: React.ReactNode;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, trigger }) => {
  const [open, setOpen] = useState(false);
  const updateUserMutation = useUpdateUser();

  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose: () => setOpen(false),
  });

  const handleSubmit = async (data: any) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        updates: data,
      });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
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
          {trigger || (
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </FormDialogTrigger>
        <FormDialogContent className="max-w-2xl">
          <FormDialogHeader>
            <FormDialogTitle>Edit User</FormDialogTitle>
            <FormDialogDescription>
              Update user information and permissions.
            </FormDialogDescription>
          </FormDialogHeader>
          <UserForm
            onSubmit={handleSubmit}
            initialData={{
              name: user.name || '',
              email: user.email,
              role: user.role,
              employment_status: user.employment_status || undefined,
              department_id: user.department_id || undefined,
              job_title_id: user.job_title_id || undefined,
              phone_number: user.phone_number || undefined,
              status: user.status as 'active' | 'inactive',
            }}
            isLoading={updateUserMutation.isPending}
            submitLabel="Update User"
            onCancel={handleFormCancel}
          />
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
