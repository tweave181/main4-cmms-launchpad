import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { Building2, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface ServiceContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  vendor_company_id: string | null;
  start_date: string;
  end_date: string;
  contract_cost: number | null;
  status: string;
  description: string | null;
  email_reminder_enabled: boolean;
  reminder_days_before: number | null;
  visit_count: number | null;
  company_details?: {
    id: string;
    company_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
}

interface ContractLine {
  id: string;
  line_description: string;
  frequency: string | null;
  sla: string | null;
  cost_per_line: number | null;
}

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ServiceContract | null;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  const { formatDate, formatCurrency } = useGlobalSettings();

  const { data: contractLines = [], isLoading } = useQuery({
    queryKey: ['contract-lines', contract?.id],
    queryFn: async () => {
      if (!contract?.id) return [];

      const { data, error } = await supabase
        .from('contract_lines')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ContractLine[];
    },
    enabled: !!contract?.id && isOpen,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Terminated':
        return 'secondary';
      case 'Pending Review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contract Title</label>
                  <div className="font-medium">{contract.contract_title}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                  <div>{contract.company_details?.company_name || contract.vendor_name}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contract Value</label>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {contract.contract_cost ? formatCurrency(contract.contract_cost) : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {formatDate(contract.start_date)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-red-600" />
                    {formatDate(contract.end_date)}
                  </div>
                </div>
              </div>
              
              {contract.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <div className="text-sm">{contract.description}</div>
                  </div>
                </>
              )}

              {contract.company_details && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Vendor Contact Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {contract.company_details.email && (
                        <div>Email: {contract.company_details.email}</div>
                      )}
                      {contract.company_details.phone && (
                        <div>Phone: {contract.company_details.phone}</div>
                      )}
                      {contract.company_details.address && (
                        <div className="md:col-span-2">Address: {contract.company_details.address}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Line Items / Covered Services */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items / Covered Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading line items...</div>
                </div>
              ) : contractLines.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No line items found</h3>
                  <p className="text-muted-foreground">
                    No line items found for this contract.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Line Description</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead className="text-right">Cost per Line</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">
                          {line.line_description}
                        </TableCell>
                        <TableCell>
                          {line.frequency || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {line.sla || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.cost_per_line ? formatCurrency(line.cost_per_line) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Attachments Section - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  Attachment management will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};