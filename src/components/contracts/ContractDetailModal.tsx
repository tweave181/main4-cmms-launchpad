import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { Building2, Calendar, DollarSign, FileText, AlertCircle, Package } from 'lucide-react';
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
interface LinkedAsset {
  id: string;
  asset_tag: string | null;
  name: string;
  category: string | null;
  location: {
    name: string;
    location_code: string;
  } | null;
  department: {
    name: string;
  } | null;
}
interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ServiceContract | null;
}
export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  const {
    formatDate,
    formatCurrency
  } = useGlobalSettings();
  const {
    data: contractLines = [],
    isLoading: isLoadingLines
  } = useQuery({
    queryKey: ['contract-lines', contract?.id],
    queryFn: async () => {
      if (!contract?.id) return [];
      const {
        data,
        error
      } = await supabase.from('contract_lines').select('*').eq('contract_id', contract.id).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      return data as ContractLine[];
    },
    enabled: !!contract?.id && isOpen
  });
  const {
    data: linkedAssets = [],
    isLoading: isLoadingAssets
  } = useQuery({
    queryKey: ['contract-assets', contract?.id],
    queryFn: async () => {
      if (!contract?.id) return [];
      const {
        data,
        error
      } = await supabase.from('assets').select(`
          id,
          asset_tag,
          name,
          category,
          location:locations(name, location_code),
          department:departments(name)
        `).eq('service_contract_id', contract.id).order('asset_tag', {
        ascending: true
      });
      if (error) throw error;
      return data as LinkedAsset[];
    },
    enabled: !!contract?.id && isOpen
  });
  const isLoading = isLoadingLines || isLoadingAssets;
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
  return <Dialog open={isOpen} onOpenChange={onClose}>
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
              
              {contract.description && <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <div className="text-sm">{contract.description}</div>
                  </div>
                </>}

              {contract.company_details && <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Vendor Contact Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {contract.company_details.email && <div>Email: {contract.company_details.email}</div>}
                      {contract.company_details.phone && <div>Phone: {contract.company_details.phone}</div>}
                      {contract.company_details.address && <div className="md:col-span-2">Address: {contract.company_details.address}</div>}
                    </div>
                  </div>
                </>}
            </CardContent>
          </Card>

          {/* Line Items / Covered Services */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items / Covered Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading...</div>
                </div> : <div className="space-y-6">
                  {/* Contract Lines Section */}
                  {contractLines.length > 0 && <div>
                      <h4 className="text-sm font-semibold mb-3">Contract Line Items</h4>
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
                          {contractLines.map(line => <TableRow key={line.id}>
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
                            </TableRow>)}
                        </TableBody>
                      </Table>
                    </div>}

                  {/* Linked Assets Section */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Assets Covered by This Contract
                    </h4>
                    {linkedAssets.length === 0 ? <div className="text-center py-6 border border-dashed rounded-lg">
                        <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">
                          No assets are currently linked to this contract.
                        </p>
                      </div> : <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="bg-gray-300">Asset Tag</TableHead>
                            <TableHead className="bg-gray-300">Asset Name</TableHead>
                            <TableHead className="bg-gray-300">Location</TableHead>
                            <TableHead className="bg-gray-300">Category</TableHead>
                            <TableHead className="bg-gray-300">Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {linkedAssets.map(asset => <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      // Optional: Navigate to asset details
                      window.open(`/assets?asset=${asset.id}`, '_blank');
                    }}>
                              <TableCell className="font-medium">
                                {asset.asset_tag || 'N/A'}
                              </TableCell>
                              <TableCell>{asset.name}</TableCell>
                              <TableCell>
                                {asset.location ? `${asset.location.name} (${asset.location.location_code})` : 'N/A'}
                              </TableCell>
                              <TableCell>{asset.category || 'N/A'}</TableCell>
                              <TableCell>{asset.department?.name || 'N/A'}</TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>}
                  </div>

                  {/* Show message if no line items and no assets */}
                  {contractLines.length === 0 && linkedAssets.length === 0 && <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No coverage items found</h3>
                      <p className="text-muted-foreground">
                        No line items or assets are currently associated with this contract.
                      </p>
                    </div>}
                </div>}
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

          {/* Record Information */}
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>Record Information</span>
              <span>Created At: {formatDate(contract.start_date)}</span>
              <span>Last Updated: {formatDate(contract.end_date)}</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};