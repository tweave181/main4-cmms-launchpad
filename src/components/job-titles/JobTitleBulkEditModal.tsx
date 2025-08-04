
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedJobTitles: JobTitle[];
}

const bulkEditSchema = z.object({
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

type BulkEditFormData = z.infer<typeof bulkEditSchema>;

export const JobTitleBulkEditModal: React.FC<JobTitleBulkEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedJobTitles,
}) => {
  const form = useForm<BulkEditFormData>({
    resolver: zodResolver(bulkEditSchema),
    defaultValues: {
      prefix: '',
      suffix: '',
    },
  });

  const onSubmit = async (data: BulkEditFormData) => {
    try {
      const updates = selectedJobTitles.map(jobTitle => {
        let newTitle = jobTitle.title_name;
        
        if (data.prefix?.trim()) {
          newTitle = `${data.prefix.trim()} ${newTitle}`;
        }
        
        if (data.suffix?.trim()) {
          newTitle = `${newTitle} ${data.suffix.trim()}`;
        }

        return {
          id: jobTitle.id,
          title_name: newTitle,
          tenant_id: jobTitle.tenant_id,
        };
      });

      // Update each job title
      for (const update of updates) {
        const { error } = await supabase
          .from('job_titles')
          .update({ title_name: update.title_name })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${selectedJobTitles.length} job titles updated successfully`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Bulk edit error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Bulk Edit Job Titles ({selectedJobTitles.length} selected)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Add Prefix</Label>
            <Input
              id="prefix"
              {...form.register('prefix')}
              placeholder="e.g., Senior"
            />
            <p className="text-sm text-gray-500">
              Text to add before each job title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Add Suffix</Label>
            <Input
              id="suffix"
              {...form.register('suffix')}
              placeholder="e.g., Level I"
            />
            <p className="text-sm text-gray-500">
              Text to add after each job title
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
              {selectedJobTitles.slice(0, 3).map(jobTitle => {
                let preview = jobTitle.title_name;
                const prefix = form.watch('prefix')?.trim();
                const suffix = form.watch('suffix')?.trim();
                
                if (prefix) preview = `${prefix} ${preview}`;
                if (suffix) preview = `${preview} ${suffix}`;
                
                return (
                  <div key={jobTitle.id}>
                    {jobTitle.title_name} → {preview}
                  </div>
                );
              })}
              {selectedJobTitles.length > 3 && (
                <div className="text-gray-400">
                  ...and {selectedJobTitles.length - 3} more
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-start space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Updating...' : 'Update All'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
