import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Building2, Calendar, DollarSign, Mail, FileText, Edit, Package, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';

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
  } | null;
  address?: {
    id: string;
    address_line_1: string;
    address_line_2: string | null;
    address_line_3: string | null;
    town_or_city: string | null;
    county_or_state: string | null;
    postcode: string | null;
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

const ServiceContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { formatDate, formatCurrency } = useGlobalSettings();

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['service-contract', id],
    queryFn: async () => {
      if (!id || !userProfile?.tenant_id) {
        throw new Error('Missing contract ID or tenant');
      }

      const { data, error } = await supabase
        .from('service_contracts')
        .select(`
          *,
          company_details:vendor_company_id (
            id,
            company_name,
            email,
            phone
          ),
          address:address_id (
            id,
            address_line_1,
            address_line_2,
            address_line_3,
            town_or_city,
            county_or_state,
            postcode
          )
        `)
        .eq('id', id)
        .eq('tenant_id', userProfile.tenant_id)
        .single();

      if (error) throw error;
      return data as ServiceContract;
    },
    enabled: !!id && !!userProfile?.tenant_id,
  });

  const { data: contractLines = [], isLoading: isLoadingLines } = useQuery({
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
    enabled: !!contract?.id,
  });

  const { data: linkedAssets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ['contract-assets', contract?.id],
    queryFn: async () => {
      if (!contract?.id) return [];
      const { data, error } = await supabase
        .from('assets')
        .select(`
          id,
          asset_tag,
          name,
          category,
          location:locations(name, location_code),
          department:departments(name)
        `)
        .eq('service_contract_id', contract.id)
        .order('asset_tag', { ascending: true });
      if (error) throw error;
      return data as LinkedAsset[];
    },
    enabled: !!contract?.id,
  });

  const isLoadingCoverage = isLoadingLines || isLoadingAssets;

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

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading contract details...</div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Contract not found or error loading details
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/service-contracts">Service Contracts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{contract.contract_title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/service-contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contract.contract_title}</h1>
            <p className="text-muted-foreground">Contract Details</p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Edit Contract
        </Button>
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Contract Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Title</label>
                  <p className="font-medium">{contract.contract_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="font-medium">{formatDate(contract.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="font-medium">{formatDate(contract.end_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Cost</label>
                  <p className="font-medium">
                    {contract.contract_cost ? formatCurrency(contract.contract_cost) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Days Until Expiry</label>
                  <p className={`font-medium ${daysUntilExpiry <= 7 ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                  </p>
                </div>
              </div>
              {contract.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">{contract.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Vendor Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                  <p className="font-medium">
                    {contract.company_details?.company_name || contract.vendor_name}
                  </p>
                </div>
                {contract.company_details?.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{contract.company_details.email}</p>
                  </div>
                )}
                {contract.company_details?.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{contract.company_details.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Address</label>
                  {contract.address ? (
                    <div className="font-medium">
                      <div>{contract.address.address_line_1}</div>
                      {contract.address.address_line_2 && <div>{contract.address.address_line_2}</div>}
                      <div>
                        {[contract.address.town_or_city, contract.address.county_or_state, contract.address.postcode]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-muted-foreground">No specific service address</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Reminder Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Reminders</label>
                <p className="font-medium">
                  {contract.email_reminder_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {contract.reminder_days_before && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reminder Period</label>
                  <p className="font-medium">{contract.reminder_days_before} days before expiry</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Contract Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.visit_count && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Planned Visits</label>
                  <p className="font-medium">{contract.visit_count}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Duration</label>
                <p className="font-medium">
                  {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Items covered by this Contract */}
      <Card>
        <CardHeader>
          <CardTitle>Items covered by this Contract</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCoverage ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contract Lines Section */}
              {contractLines.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Contract Line Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
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
                </div>
              )}

              {/* Linked Assets Section */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Assets Covered by This Contract
                </h4>
                {linkedAssets.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">
                      No assets are currently linked to this contract.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedAssets.map((asset) => (
                        <TableRow
                          key={asset.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            window.open(`/assets?asset=${asset.id}`, '_blank');
                          }}
                        >
                          <TableCell className="font-medium">
                            {asset.asset_tag || 'N/A'}
                          </TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>
                            {asset.location ? `${asset.location.name} (${asset.location.location_code})` : 'N/A'}
                          </TableCell>
                          <TableCell>{asset.category || 'N/A'}</TableCell>
                          <TableCell>{asset.department?.name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Show message if no line items and no assets */}
              {contractLines.length === 0 && linkedAssets.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No coverage items found</h3>
                  <p className="text-muted-foreground">
                    No line items or assets are currently associated with this contract.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceContractDetail;