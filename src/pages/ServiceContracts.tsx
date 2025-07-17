import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Calendar, DollarSign, Building2, Mail, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceContractModal } from '@/components/contracts/ServiceContractModal';
import { useAuth } from '@/contexts/auth';
import { formatDistanceToNow, format } from 'date-fns';

interface ServiceContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  start_date: string;
  end_date: string;
  contract_cost: number | null;
  status: string;
  description: string | null;
  email_reminder_enabled: boolean;
  reminder_days_before: number | null;
  visit_count: number | null;
}

const ServiceContracts: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['service-contracts', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { data, error } = await supabase
        .from('service_contracts')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data as ServiceContract[];
    },
    enabled: !!userProfile?.tenant_id,
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Service Contracts</h1>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading contracts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
                  ${contracts.reduce((sum, c) => sum + (c.contract_cost || 0), 0).toLocaleString()}
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
          <CardTitle>All Service Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No service contracts found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first service contract
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contract
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days Until Expiry</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.contract_title}</div>
                          {contract.description && (
                            <div className="text-sm text-muted-foreground">
                              {contract.description.substring(0, 50)}
                              {contract.description.length > 50 && '...'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{contract.vendor_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(contract.start_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${
                          daysUntilExpiry <= 7 ? 'text-red-600' :
                          daysUntilExpiry <= 30 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contract.contract_cost ? 
                          `$${contract.contract_cost.toLocaleString()}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {contract.email_reminder_enabled ? (
                            <Mail className="h-4 w-4 text-green-600" />
                          ) : (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          )}
                          {contract.reminder_days_before && (
                            <span className="text-sm text-muted-foreground">
                              {contract.reminder_days_before}d
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ServiceContracts;