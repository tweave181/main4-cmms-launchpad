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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkOrderComment } from '@/hooks/useWorkOrderComments';
import { MessageSquarePlus } from 'lucide-react';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface AddCommentModalProps {
  workOrderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddCommentModal: React.FC<AddCommentModalProps> = ({
  workOrderId,
  isOpen,
  onClose,
}) => {
  const createCommentMutation = useCreateWorkOrderComment();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createCommentMutation.mutateAsync({
        work_order_id: workOrderId,
        comment: data.comment,
        comment_type: 'comment',
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <span>Add Comment</span>
          </DialogTitle>
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
              <p className="text-sm text-red-600 mt-1">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex justify-start space-x-2">
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
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};