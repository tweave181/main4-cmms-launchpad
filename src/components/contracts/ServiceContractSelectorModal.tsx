import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { ServiceContractModal } from './ServiceContractModal';

interface ServiceContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  status: string;
  end_date: string;
  start_date: string;
  contract_cost: number | null;
}

interface ServiceContractSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  onContractLinked?: () => void;
}

export const ServiceContractSelectorModal: React.FC<ServiceContractSelectorModalProps> = ({
  isOpen,
  onClose,
  assetId,
  onContractLinked,
}) => {
  const { formatDate, formatCurrency } = useGlobalSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ['service-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_contracts')
        .select('id, contract_title, vendor_name, status, end_date, start_date, contract_cost')
        .order('contract_title');

      if (error) throw error;
      return data as ServiceContract[];
    },
    enabled: isOpen,
  });

  const filteredContracts = contracts.filter(contract =>
    contract.contract_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLinkContract = async (contractId: string) => {
    try {
      setIsLinking(contractId);
      const { error } = await supabase
        .from('assets')
        .update({ service_contract_id: contractId })
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service contract linked successfully",
      });

      onContractLinked?.();
      onClose();
    } catch (error) {
      console.error('Error linking contract:', error);
      toast({
        title: "Error",
        description: "Failed to link service contract",
        variant: "destructive",
      });
    } finally {
      setIsLinking(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'pending review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateContract = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    refetch(); // Refresh contracts list
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Link Service Contract</DialogTitle>
            <DialogDescription>
              Select an existing service contract to link to this asset.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden">
            {/* Search and Create New Button */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts by title or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={handleCreateContract}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Contract
              </Button>
            </div>

            {/* Contracts List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading contracts...</div>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {contracts.length === 0 ? 'No Service Contracts' : 'No Matching Contracts'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {contracts.length === 0 
                      ? 'No service contracts have been created yet.'
                      : 'No contracts match your search criteria.'
                    }
                  </p>
                  {contracts.length === 0 && (
                    <Button onClick={handleCreateContract}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Contract
                    </Button>
                  )}
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">{contract.contract_title}</h3>
                            <Badge className={getStatusColor(contract.status)} variant="secondary">
                              {contract.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Vendor:</span>
                              <div>{contract.vendor_name}</div>
                            </div>
                            <div>
                              <span className="font-medium">Contract Period:</span>
                              <div>{formatDate(contract.start_date)} - {formatDate(contract.end_date)}</div>
                            </div>
                            {contract.contract_cost && (
                              <div>
                                <span className="font-medium">Cost:</span>
                                <div>{formatCurrency(contract.contract_cost)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button
                            onClick={() => handleLinkContract(contract.id)}
                            disabled={isLinking === contract.id}
                            size="sm"
                          >
                            {isLinking === contract.id ? 'Linking...' : 'Link Contract'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ServiceContractModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        assetId={assetId}
      />
    </>
  );
};