import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommentStatusOptions } from '@/hooks/useWorkOrderComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const editCommentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
  comment_status_name: z.string().optional(),
});

type EditCommentFormData = z.infer<typeof editCommentSchema>;

interface WorkOrderComment {
  id: string;
  comment: string;
  comment_status_name?: string;
  work_order_id: string;
}

interface EditCommentModalProps {
  comment: WorkOrderComment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCommentModal: React.FC<EditCommentModalProps> = ({
  comment,
  isOpen,
  onClose,
}) => {
  const { data: statusOptions = [] } = useCommentStatusOptions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditCommentFormData>({
    resolver: zodResolver(editCommentSchema),
    defaultValues: {
      comment: comment?.comment || '',
      comment_status_name: comment?.comment_status_name || 'Open',
    },
  });

  React.useEffect(() => {
    if (comment) {
      reset({
        comment: comment.comment,
        comment_status_name: comment.comment_status_name || 'Open',
      });
    }
  }, [comment, reset]);

  const onSubmit = async (data: EditCommentFormData) => {
    if (!comment) return;

    try {
      const { error } = await supabase
        .from('work_order_comments')
        .update({
          comment: data.comment,
          comment_status_name: data.comment_status_name,
        })
        .eq('id', comment.id);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['work-order-comments'] });
      queryClient.invalidateQueries({ queryKey: ['work-order-activities'] });

      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!comment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Enter your comment..."
              rows={4}
              className="mt-1"
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment_status">Comment Status</Label>
            <Controller
              name="comment_status_name"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.id} value={option.status_name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: option.status_color }}
                          />
                          {option.status_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};