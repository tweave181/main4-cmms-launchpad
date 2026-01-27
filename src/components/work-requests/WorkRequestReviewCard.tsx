import React, { useState } from 'react';
import { WorkRequest } from '@/types/workRequest';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateWorkRequest, useConvertToWorkOrder } from '@/hooks/useWorkRequests';
import { format } from 'date-fns';
import { CheckCircle, XCircle, ArrowRight, Clock, User, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WorkRequestReviewCardProps {
  request: WorkRequest;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const WorkRequestReviewCard: React.FC<WorkRequestReviewCardProps> = ({ request }) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [workOrderTitle, setWorkOrderTitle] = useState(request.title);
  const [workOrderDescription, setWorkOrderDescription] = useState(request.description);
  const [workOrderPriority, setWorkOrderPriority] = useState(request.priority);
  const [assignedTo, setAssignedTo] = useState<string>('');
  
  const updateRequest = useUpdateWorkRequest();
  const convertToWorkOrder = useConvertToWorkOrder();
  
  const { data: users = [] } = useQuery({
    queryKey: ['users-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
  
  const handleApprove = async () => {
    await updateRequest.mutateAsync({ id: request.id, status: 'approved' });
  };
  
  const handleReject = async () => {
    await updateRequest.mutateAsync({ 
      id: request.id, 
      status: 'rejected', 
      rejection_reason: rejectionReason 
    });
    setShowRejectDialog(false);
    setRejectionReason('');
  };
  
  const handleConvert = async () => {
    await convertToWorkOrder.mutateAsync({
      requestId: request.id,
      workOrderData: {
        title: workOrderTitle,
        description: workOrderDescription,
        priority: workOrderPriority,
        location_id: request.location_id || undefined,
        assigned_to: assignedTo || undefined,
      },
    });
    setShowConvertDialog(false);
  };
  
  const isPending = request.status === 'pending';
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`w-1 h-full min-h-[100px] rounded-full ${getPriorityColor(request.priority)}`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-sm text-muted-foreground">
                  {request.request_number}
                </span>
                <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'outline'}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
                <Badge variant="outline">{request.category}</Badge>
                <Badge variant="outline" className="capitalize">{request.priority}</Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{request.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {request.submitter?.name || 'Unknown'}
                </span>
                {(request.location?.name || request.location_description) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.location?.name || request.location_description}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              {request.status === 'rejected' && request.rejection_reason && (
                <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                  <strong>Rejection reason:</strong> {request.rejection_reason}
                </div>
              )}
              
              {request.status === 'converted' && request.work_order?.work_order_number && (
                <div className="mt-3 p-2 bg-primary/10 rounded text-sm text-primary">
                  Converted to Work Order: <strong>{request.work_order.work_order_number}</strong>
                </div>
              )}
            </div>
            
            {isPending && (
              <div className="flex flex-col gap-2">
                <Button 
                  size="sm" 
                  onClick={handleApprove}
                  disabled={updateRequest.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={updateRequest.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowConvertDialog(true)}
                  disabled={convertToWorkOrder.isPending}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Create WO
                </Button>
              </div>
            )}
            
            {request.status === 'approved' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowConvertDialog(true)}
                disabled={convertToWorkOrder.isPending}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Create Work Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Work Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This will be visible to the submitter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={updateRequest.isPending}
            >
              {updateRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Convert to Work Order Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Work Order from Request</DialogTitle>
            <DialogDescription>
              Review and adjust the details before creating the work order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={workOrderTitle}
                onChange={(e) => setWorkOrderTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={workOrderDescription}
                onChange={(e) => setWorkOrderDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={workOrderPriority} onValueChange={(v: any) => setWorkOrderPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConvert}
              disabled={convertToWorkOrder.isPending}
            >
              {convertToWorkOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
