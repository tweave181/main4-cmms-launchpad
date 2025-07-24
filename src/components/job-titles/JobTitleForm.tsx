
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog, FormDialogContent, FormDialogHeader, FormDialogTitle } from '@/components/ui/form-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useJobTitleForm } from './useJobTitleForm';
import { useFormDialog } from '@/hooks/useFormDialog';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleFormProps {
  jobTitle?: JobTitle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobTitleForm: React.FC<JobTitleFormProps> = ({
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { form, onSubmit, isEditing } = useJobTitleForm({
    jobTitle,
    onSuccess,
  });

  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose,
  });

  return (
    <>
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="sm:max-w-[425px]">
          <FormDialogHeader>
            <FormDialogTitle>
              {isEditing ? 'Edit Job Title' : 'Create Job Title'}
            </FormDialogTitle>
          </FormDialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_name">Title Name</Label>
              <Input
                id="title_name"
                {...form.register('title_name')}
                placeholder="Enter job title name"
              />
              {form.formState.errors.title_name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.title_name.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </form>
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
