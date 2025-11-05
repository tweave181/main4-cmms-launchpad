import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Mail, User, Filter, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { EditCommentModal } from './EditCommentModal';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { handleError } from '@/utils/errorHandling';

interface ActivityLogProps {
  workOrderId: string;
}

interface WorkOrderComment {
  id: string;
  comment: string;
  comment_type: string;
  comment_status_name?: string;
  created_at: string;
  user_id: string;
  work_order_id: string;
  user?: {
    name: string;
  };
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ workOrderId }) => {
  const [showContactEventsOnly, setShowContactEventsOnly] = useState(false);
  const [editingComment, setEditingComment] = useState<WorkOrderComment | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['work-order-activities', workOrderId, userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_comments')
        .select(`
          *,
          user:users(name)
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (WorkOrderComment & { user: { name: string } })[];
    },
    enabled: !!userProfile?.tenant_id && !!workOrderId,
  });

  const filteredActivities = showContactEventsOnly 
    ? activities.filter(activity => activity.comment_type === 'contact_event')
    : activities;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_event':
        return activities.find(a => a.comment.includes('phone')) ? Phone : Mail;
      default:
        return MessageSquare;
    }
  };

  const getActivityBadge = (type: string, statusName?: string) => {
    switch (type) {
      case 'contact_event':
        return <Badge variant="outline" className="text-xs">Contact</Badge>;
      case 'status_change':
        return <Badge variant="outline" className="text-xs">Status</Badge>;
      case 'assignment':
        return <Badge variant="outline" className="text-xs">Assignment</Badge>;
      default:
        return statusName ? (
          <Badge variant="outline" className="text-xs">{statusName}</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Comment</Badge>
        );
    }
  };

  const handleEditComment = (comment: WorkOrderComment) => {
    setEditingComment(comment);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['work-order-activities', workOrderId] });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error) {
      handleError(error, 'ActivityLog:deleteComment', {
        showToast: true,
        toastTitle: "Failed to Delete Comment",
        additionalData: { workOrderId, commentId },
      });
    }
  };

  const canEditComment = (comment: WorkOrderComment) => {
    return comment.user_id === userProfile?.id || userProfile?.role === 'admin';
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={showContactEventsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowContactEventsOnly(!showContactEventsOnly)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showContactEventsOnly ? 'Show All' : 'Contact Events Only'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No {showContactEventsOnly ? 'contact events' : 'activity'} recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.comment_type);
              const canEdit = canEditComment(activity);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.user?.name || 'Unknown User'}
                      </span>
                      {getActivityBadge(activity.comment_type, activity.comment_status_name)}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{activity.comment}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleEditComment(activity)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteComment(activity.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <EditCommentModal
        comment={editingComment}
        isOpen={!!editingComment}
        onClose={() => setEditingComment(null)}
      />
    </Card>
  );
};