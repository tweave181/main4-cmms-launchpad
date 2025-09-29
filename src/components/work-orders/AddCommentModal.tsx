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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkOrderComment, useCommentStatusOptions } from '@/hooks/useWorkOrderComments';
import { MessageSquarePlus, Calendar, Clock, Hash } from 'lucide-react';
import { format } from 'date-fns';
import type { WorkOrder } from '@/types/workOrder';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
  comment_status_name: z.string().optional(),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface AddCommentModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const AddCommentModal: React.FC<AddCommentModalProps> = ({
  workOrder,
  isOpen,
  onClose,
}) => {
  const createCommentMutation = useCreateWorkOrderComment();
  const { data: statusOptions = [] } = useCommentStatusOptions();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment_status_name: statusOptions[0]?.status_name || 'Open',
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createCommentMutation.mutateAsync({
        work_order_id: workOrder.id,
        comment: data.comment,
        comment_type: 'comment',
        comment_status_name: data.comment_status_name,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <span>Add Comment</span>
          </DialogTitle>
        </DialogHeader>

        {/* Work Order Context */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {workOrder.work_order_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-medium text-foreground">{workOrder.title}</h3>
              {workOrder.description && (
                <p className="text-sm text-muted-foreground mt-1">{workOrder.description}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getStatusColor(workOrder.status)} text-white`}>
                {workOrder.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${getPriorityColor(workOrder.priority)} text-white`}>
                {workOrder.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {format(new Date(workOrder.created_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(workOrder.created_at), 'HH:mm')}</span>
              </div>
            </div>
            
            {workOrder.assigned_user && (
              <div className="text-sm">
                <span className="text-muted-foreground">Assigned to: </span>
                <span className="font-medium">{workOrder.assigned_user.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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