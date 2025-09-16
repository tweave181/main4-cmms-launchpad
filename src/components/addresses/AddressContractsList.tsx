import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, DollarSign, Building2 } from 'lucide-react';
import { useAddressContracts } from '@/hooks/useAddressContracts';
import { useNavigate } from 'react-router-dom';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { formatDistanceToNow, format } from 'date-fns';

interface AddressContractsListProps {
  addressId: string;
}

export const AddressContractsList: React.FC<AddressContractsListProps> = ({ addressId }) => {
  const { data: contracts, isLoading, error } = useAddressContracts(addressId);
  const navigate = useNavigate();
  const { formatDate, formatCurrency } = useGlobalSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Error loading contracts. Please try again.</p>
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No service contracts linked to this address yet.</p>
        <p className="text-sm mt-2">Contracts will appear here when they are associated with this address.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (contract: any) => {
    const endDate = new Date(contract.end_date);
    const today = new Date();
    
    if (endDate < today) {
      return 'Expired';
    }
    
    return contract.status || 'Active';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Title</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{contract.contract_title}</div>
                  {contract.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {contract.description.length > 100 
                        ? `${contract.description.substring(0, 100)}...` 
                        : contract.description
                      }
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {contract.company_details?.company_name || contract.vendor_name}
                      </div>
                      {contract.company_details?.email && (
                        <div className="text-sm text-muted-foreground">
                          {contract.company_details.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(getStatusText(contract))}
                  >
                    {getStatusText(contract)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {formatDate(contract.end_date)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(contract.end_date), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {contract.contract_cost ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(contract.contract_cost)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/service-contracts/${contract.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};