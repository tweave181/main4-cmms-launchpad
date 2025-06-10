
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wrench, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderDetail } from '@/components/work-orders/WorkOrderDetail';
import type { WorkOrder } from '@/types/workOrder';

interface AssetWorkOrdersProps {
  assetId: string;
}

export const AssetWorkOrders: React.FC<AssetWorkOrdersProps> = ({ assetId }) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['asset-work-orders', assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          assigned_user:users!assigned_to(name),
          created_user:users!created_by(name),
          asset:assets(name)
        `)
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (WorkOrder & {
        assigned_user?: { name: string } | null;
        created_user?: { name: string } | null;
        asset?: { name: string } | null;
      })[];
    },
  });

  const selectedWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrderId);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRowClick = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
  };

  const handleRowDoubleClick = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span>Related Work Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span>Related Work Orders ({workOrders.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No work orders found for this asset</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder) => (
                    <TableRow 
                      key={workOrder.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedWorkOrderId === workOrder.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleRowClick(workOrder.id)}
                      onDoubleClick={() => handleRowDoubleClick(workOrder.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{workOrder.title}</p>
                          {workOrder.description && (
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {workOrder.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(workOrder.status)} variant="secondary">
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(workOrder.priority)} variant="secondary">
                          {workOrder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {workOrder.assigned_user?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(workOrder.created_at)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedWorkOrderId(null);
          }}
        />
      )}
    </>
  );
};
