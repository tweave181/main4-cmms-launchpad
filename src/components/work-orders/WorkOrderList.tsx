
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Wrench, Building2, MessageSquarePlus } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { cn } from '@/lib/utils';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/auth';
import { ContractorDetailsModal } from './ContractorDetailsModal';
import { AddCommentModal } from './AddCommentModal';
import type { WorkOrder } from '@/types/workOrder';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  loading?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'open':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


// Helper to compute overdue days
const getDaysOverdue = (due_date: string) => {
  const today = new Date();
  const due = new Date(due_date);
  // Remove time portion for accurate comparison
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
  workOrders,
  onWorkOrderClick,
  loading = false,
}) => {
  const { formatDate } = useGlobalSettings();
  const { userProfile } = useAuth();
  const [selectedContractor, setSelectedContractor] = useState<{ 
    id: string; 
    workOrder: WorkOrder; 
  } | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState<WorkOrder | null>(null);
  const { data: contractors = [] } = useCompanies('contractor');
  
  const isAdmin = userProfile?.role === 'admin';
  
  const handleContractorClick = (e: React.MouseEvent, contractorId: string, workOrder: WorkOrder) => {
    e.stopPropagation();
    setSelectedContractor({ id: contractorId, workOrder });
  };

  const handleCloseModal = () => {
    setSelectedContractor(null);
  };

  const handleCommentClick = (e: React.MouseEvent, workOrder: WorkOrder) => {
    e.stopPropagation();
    setCommentModalOpen(workOrder);
  };

  const handleCloseCommentModal = () => {
    setCommentModalOpen(null);
  };
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
          <p className="text-gray-500 text-center">
            Create your first work order to get started with maintenance management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {workOrders.map((workOrder) => {
        let isOverdue = false;
        let daysOverdue = 0;
        if (workOrder.due_date) {
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const dueDateObj = new Date(workOrder.due_date);
          dueDateObj.setHours(0, 0, 0, 0);
          isOverdue =
            todayDate.getTime() > dueDateObj.getTime() &&
            workOrder.status !== 'completed' &&
            workOrder.status !== 'cancelled';
          daysOverdue = getDaysOverdue(workOrder.due_date);
        }

        const isCompleted = workOrder.status === 'completed';
        const canEdit = isAdmin || !isCompleted;

        return (
          <Card
            key={workOrder.id}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              !canEdit && "opacity-75"
            )}
            onClick={() => onWorkOrderClick(workOrder)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                    {workOrder.work_order_number}
                  </div>
                  <h3 className="font-semibold text-lg truncate pr-2">{workOrder.title}</h3>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleCommentClick(e, workOrder)}
                    className="p-2 h-8 w-8"
                    title="Add comment"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                  <Badge className={cn('text-xs', getPriorityColor(workOrder.priority))}>
                    {workOrder.priority.toUpperCase()}
                  </Badge>
                  <Badge className={cn('text-xs', getStatusColor(workOrder.status))}>
                    {workOrder.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {workOrder.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{workOrder.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4" />
                  <span className="capitalize">{workOrder.work_type}</span>
                </div>

                {workOrder.due_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                      Due: {formatDate(workOrder.due_date)}
                    </span>
                    {isOverdue && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium text-xs">
                        {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                      </span>
                    )}
                  </div>
                )}

                {workOrder.estimated_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{workOrder.estimated_hours}h estimated</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Assigned To:</span>
                  {workOrder.assigned_to ? (
                    <span className="text-green-600">Assigned</span>
                  ) : (
                    <span className="text-red-600">Unassigned</span>
                  )}
                </div>

                {workOrder.assigned_to_contractor && workOrder.contractor_company_id && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>
                      Contractor:{' '}
                      <button
                        className="text-primary hover:underline cursor-pointer font-medium"
                        onClick={(e) => handleContractorClick(e, workOrder.contractor_company_id!, workOrder)}
                      >
                        {contractors.find(c => c.id === workOrder.contractor_company_id)?.company_name || 'Unknown Contractor'}
                      </button>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Created {formatDate(workOrder.created_at)}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {selectedContractor && (
        <ContractorDetailsModal
          isOpen={!!selectedContractor}
          onClose={handleCloseModal}
          contractorId={selectedContractor.id}
          workOrder={selectedContractor.workOrder}
        />
      )}
      
      {commentModalOpen && (
        <AddCommentModal
          workOrder={commentModalOpen}
          isOpen={!!commentModalOpen}
          onClose={handleCloseCommentModal}
        />
      )}
    </div>
  );
};
