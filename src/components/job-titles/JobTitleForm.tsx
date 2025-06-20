
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJobTitleForm } from './useJobTitleForm';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job Title' : 'Create Job Title'}
          </DialogTitle>
        </DialogHeader>
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
            <Button type="button" variant="outline" onClick={onClose}>
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
      </DialogContent>
    </Dialog>
  );
};
