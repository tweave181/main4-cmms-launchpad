
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobTitles } from '@/hooks/queries/useJobTitles';
import type { UserFormData } from './userFormSchema';

interface UserJobTitleFieldProps {
  control: Control<UserFormData>;
}

export const UserJobTitleField: React.FC<UserJobTitleFieldProps> = ({ control }) => {
  const { data: jobTitles, isLoading } = useJobTitles();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <FormField
      control={control}
      name="job_title_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Job Title</FormLabel>
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
