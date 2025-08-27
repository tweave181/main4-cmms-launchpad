import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Plus, FileText, Calendar, DollarSign, Building2, Mail, Settings, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceContractModal } from '@/components/contracts/ServiceContractModal';
import { ContractDetailModal } from '@/components/contracts/ContractDetailModal';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { formatDistanceToNow, format } from 'date-fns';
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
    company_address_id: string | null;
  } | null;
}
const ServiceContracts: React.FC = () => {
  const {
    userProfile
  } = useAuth();
  const {
    formatDate,
    formatCurrency
  } = useGlobalSettings();
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contractForDetail, setContractForDetail] = useState<ServiceContract | null>(null);
  const {
    data: contracts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['service-contracts', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }
      const {
        data,
        error
      } = await supabase.from('service_contracts').select(`
          *,
          company_details:vendor_company_id (
            id,
            company_name,
            email,
            phone,
            company_address_id
          )
        `).eq('tenant_id', userProfile.tenant_id).order('end_date', {
        ascending: true
      });
      if (error) throw error;
      return data as ServiceContract[];
    },
    enabled: !!userProfile?.tenant_id
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
  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const handleViewDetails = (contract: ServiceContract) => {
    setContractForDetail(contract);
    setIsDetailModalOpen(true);
  };
  if (isLoading) {
    return <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Service Contracts</h1>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading contracts...</div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Service Contracts</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Error loading contracts: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/settings">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Service Contracts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Contracts</h1>
          <p className="text-muted-foreground">
            Manage and monitor your service contracts and maintenance agreements
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{contracts.length}</p>
                <p className="text-xs text-muted-foreground">Total Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => c.status === 'Active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => {
                  const days = getDaysUntilExpiry(c.end_date);
                  return days <= 30 && days > 0;
                }).length}
                </p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                 <p className="text-2xl font-bold">
                   {formatCurrency(contracts.reduce((sum, c) => sum + (c.contract_cost || 0), 0))}
                 </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Contracts List</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No service contracts found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first service contract
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contract
              </Button>
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-300 rounded-md">Contract</TableHead>
                  <TableHead className="bg-gray-300">Vendor</TableHead>
                  <TableHead className="bg-gray-300">Status</TableHead>
                  <TableHead className="bg-gray-300">Start Date</TableHead>
                  <TableHead className="bg-gray-300">End Date</TableHead>
                  <TableHead className="bg-gray-300">Days Until Expiry</TableHead>
                  <TableHead className="bg-gray-300">Cost</TableHead>
                  <TableHead className="bg-gray-300">Reminders</TableHead>
                  <TableHead className="bg-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map(contract => {
              const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
              return <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.contract_title}</div>
                          {contract.description && <div className="text-sm text-muted-foreground">
                              {contract.description.substring(0, 50)}
                              {contract.description.length > 50 && '...'}
                            </div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {contract.company_details?.company_name || contract.vendor_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                       <TableCell>
                         {formatDate(contract.start_date)}
                       </TableCell>
                       <TableCell>
                         {formatDate(contract.end_date)}
                       </TableCell>
                      <TableCell>
                        <div className={`font-medium ${daysUntilExpiry <= 7 ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                        </div>
                      </TableCell>
                       <TableCell>
                         {contract.contract_cost ? formatCurrency(contract.contract_cost) : 'N/A'}
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {contract.email_reminder_enabled ? <Mail className="h-4 w-4 text-green-600" /> : <Mail className="h-4 w-4 text-muted-foreground" />}
                          {contract.reminder_days_before && <span className="text-sm text-muted-foreground">
                              {contract.reminder_days_before}d
                            </span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(contract)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      <ServiceContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ContractDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        contract={contractForDetail} 
      />
    </div>;
};
export default ServiceContracts;