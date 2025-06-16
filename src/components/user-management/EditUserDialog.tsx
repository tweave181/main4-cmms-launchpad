
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { UserForm } from './UserForm';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          onSubmit={handleSubmit}
          initialData={{
            name: user.name || '',
            email: user.email,
            role: user.role,
            employment_status: user.employment_status || undefined,
            department_id: user.department_id || undefined,
            phone_number: user.phone_number || undefined,
            status: user.status as 'active' | 'inactive',
          }}
          isLoading={updateUserMutation.isPending}
          submitLabel="Update User"
        />
      </DialogContent>
    </Dialog>
  );
};
