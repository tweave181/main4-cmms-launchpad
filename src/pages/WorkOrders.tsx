
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Plus, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportWorkOrdersToCSV, exportWorkOrdersToPDF } from '@/utils/workOrderExportUtils';
import { WorkOrderList } from '@/components/work-orders/WorkOrderList';
import { WorkOrderFiltersComponent } from '@/components/work-orders/WorkOrderFilters';
import { CreateWorkOrderModal } from '@/components/work-orders/CreateWorkOrderModal';
import { WorkOrderDetail } from '@/components/work-orders/WorkOrderDetail';
import { EditWorkOrderModal } from '@/components/work-orders/EditWorkOrderModal';
import { MobileActionButtons } from '@/components/mobile/MobileActionButtons';
import { useOfflineWorkOrders } from '@/hooks/useOfflineWorkOrders';
import type { WorkOrder, WorkOrderFilters } from '@/types/workOrder';

const WorkOrders: React.FC = () => {
  const { toast } = useToast();
  // Set default filter to show only "Open" work orders
  const [filters, setFilters] = useState<WorkOrderFilters>({ status: 'open' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: workOrders = [], isLoading, isOffline } = useOfflineWorkOrders(filters);

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
    // Reset to default filter (only open work orders)
    setFilters({ status: 'open' });
  };

  const handleQRScanned = (code: string) => {
    // Search for asset by code and open its work orders
    console.log('QR scanned:', code);
    setFilters({ search: code });
  };

  const handleExportToCSV = () => {
    if (workOrders.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no work orders to export.",
        variant: "destructive",
      });
      return;
    }
    
    exportWorkOrdersToCSV(workOrders);
    toast({
      title: "Export successful",
      description: `Exported ${workOrders.length} work order${workOrders.length !== 1 ? 's' : ''} to CSV.`,
    });
  };

  const handleExportToPDF = () => {
    if (workOrders.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no work orders to export.",
        variant: "destructive",
      });
      return;
    }
    
    exportWorkOrdersToPDF(workOrders);
    toast({
      title: "PDF Export successful",
      description: `Exported ${workOrders.length} work order${workOrders.length !== 1 ? 's' : ''} to PDF.`,
    });
  };

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Wrench className="h-6 w-6 text-primary" />
              <span>Work Orders</span>
              {isOffline && <span className="text-sm text-orange-600">(Offline)</span>}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleExportToCSV}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={isLoading || workOrders.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button 
                onClick={handleExportToPDF}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={isLoading || workOrders.length === 0}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Work Order</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WorkOrderFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
          
          {/* Mobile action buttons for scanning and quick actions */}
          <div className="md:hidden mb-4">
            <MobileActionButtons
              onQRScanned={handleQRScanned}
              showCamera={false}
              showVoice={false}
              showQR={true}
            />
          </div>
          
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
