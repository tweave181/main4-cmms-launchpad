
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Wrench, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useAuth } from '@/contexts/auth';
import { ActivityLog } from './ActivityLog';
import type { WorkOrder } from '@/types/workOrder';

interface WorkOrderDetailProps {
  workOrder: WorkOrder & {
    assigned_user?: { name: string } | null;
    created_user?: { name: string } | null;
    asset?: { name: string } | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({
  workOrder,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { formatDate, formatCurrency } = useGlobalSettings();
  const { userProfile } = useAuth();
  
  const isAdmin = userProfile?.role === 'admin';
  const isCompleted = workOrder.status === 'completed';
  const canEdit = isAdmin || !isCompleted;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex flex-col items-start space-y-1">
              <div className="text-sm text-muted-foreground font-medium">
                {workOrder.work_order_number}
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-primary" />
                <span>{workOrder.title}</span>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onEdit && canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
              {isAdmin && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              )}
              {!canEdit && isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  Read Only
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex space-x-3">
            <Badge className={getStatusColor(workOrder.status)} variant="secondary">
              {workOrder.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(workOrder.priority)} variant="secondary">
              {workOrder.priority}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {workOrder.work_type}
            </Badge>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Work Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Work Order Number</p>
                <p className="text-sm text-gray-600 font-mono">{workOrder.work_order_number}</p>
              </div>
              {workOrder.asset && (
                <div>
                  <p className="text-sm font-medium">Asset</p>
                  <p className="text-sm text-gray-600">{workOrder.asset.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Work Type</p>
                <p className="text-sm text-gray-600 capitalize">{workOrder.work_type}</p>
              </div>
              {workOrder.assigned_user && (
                <div>
                  <p className="text-sm font-medium">Assigned To</p>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{workOrder.assigned_user.name}</span>
                  </div>
                </div>
              )}
              {workOrder.created_user && (
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{workOrder.created_user.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {workOrder.description && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">{formatDate(workOrder.created_at)}</p>
                </div>
                {workOrder.due_date && (
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-gray-600">{formatDate(workOrder.due_date)}</p>
                  </div>
                )}
                {workOrder.completed_at && (
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-sm text-gray-600">{formatDate(workOrder.completed_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>Estimates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workOrder.estimated_hours && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Estimated Hours</span>
                    </div>
                    <span className="text-sm text-gray-600">{workOrder.estimated_hours}h</span>
                  </div>
                )}
                {workOrder.estimated_cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Cost</span>
                    <span className="text-sm text-gray-600">{formatCurrency(workOrder.estimated_cost)}</span>
                  </div>
                )}
                {workOrder.actual_hours && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Actual Hours</span>
                    </div>
                    <span className="text-sm text-gray-600">{workOrder.actual_hours}h</span>
                  </div>
                )}
                {workOrder.actual_cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Actual Cost</span>
                    <span className="text-sm text-gray-600">{formatCurrency(workOrder.actual_cost)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Record Information */}
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>Record Information</span>
              <span>Created At: {formatDate(workOrder.created_at)}</span>
              <span>Last Updated: {formatDate(workOrder.updated_at)}</span>
            </span>
          </div>
          
          <ActivityLog workOrderId={workOrder.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
