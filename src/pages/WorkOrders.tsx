
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Plus } from 'lucide-react';
import { WorkOrderList } from '@/components/work-orders/WorkOrderList';
import { WorkOrderFiltersComponent } from '@/components/work-orders/WorkOrderFilters';
import { CreateWorkOrderModal } from '@/components/work-orders/CreateWorkOrderModal';
import { WorkOrderDetail } from '@/components/work-orders/WorkOrderDetail';
import { EditWorkOrderModal } from '@/components/work-orders/EditWorkOrderModal';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import type { WorkOrder, WorkOrderFilters } from '@/types/workOrder';

const WorkOrders: React.FC = () => {
  const [filters, setFilters] = useState<WorkOrderFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: workOrders = [], isLoading } = useWorkOrders(filters);

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    console.log('Clicked work order:', workOrder);
    setSelectedWorkOrder(workOrder);
    setIsDetailOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDetailOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Wrench className="h-6 w-6 text-primary" />
              <span>Work Orders</span>
            </CardTitle>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Work Order</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WorkOrderFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
          
          <WorkOrderList
            workOrders={workOrders}
            onWorkOrderClick={handleWorkOrderClick}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <CreateWorkOrderModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onEdit={() => handleEditWorkOrder(selectedWorkOrder)}
        />
      )}

      {selectedWorkOrder && (
        <EditWorkOrderModal
          workOrder={selectedWorkOrder}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default WorkOrders;
