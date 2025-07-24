
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useUserForm } from './useUserForm';
import { UserBasicFields } from './UserBasicFields';
import { UserRoleFields } from './UserRoleFields';
import { UserDepartmentField } from './UserDepartmentField';
import { UserJobTitleField } from './UserJobTitleField';
import type { UserFormData } from './userFormSchema';

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  initialData?: Partial<UserFormData>;
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = 'Save User',
  onCancel,
}) => {
  const { form, handleSubmit } = useUserForm({ initialData, onSubmit });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserBasicFields control={form.control} />
          <UserRoleFields control={form.control} />
          <UserDepartmentField control={form.control} />
          <UserJobTitleField control={form.control} />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
