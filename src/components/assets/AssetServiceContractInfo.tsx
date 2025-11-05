
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, ExternalLink, Plus, Unlink } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { ContractDetailModal } from '@/components/contracts/ContractDetailModal';
import { ServiceContractSelectorModal } from '@/components/contracts/ServiceContractSelectorModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import type { Asset } from './types';

interface AssetServiceContractInfoProps {
  asset: Asset;
  onUpdate?: () => void;
}

export const AssetServiceContractInfo: React.FC<AssetServiceContractInfoProps> = ({
  asset,
  onUpdate,
}) => {
  const { formatDate } = useGlobalSettings();
  const [isContractModalOpen, setIsContractModalOpen] = React.useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = React.useState(false);
  const [isUnlinking, setIsUnlinking] = React.useState(false);

  const handleUnlinkContract = async () => {
    try {
      setIsUnlinking(true);
      const { error } = await supabase
        .from('assets')
        .update({ service_contract_id: null })
        .eq('id', asset.id);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Service contract unlinked successfully",
      });
      
      // Call onUpdate to refresh the asset data
      onUpdate?.();
      
      // Optionally open the Add Service Contract modal
      setIsAddContractModalOpen(true);
    } catch (error) {
      console.error('Error unlinking contract:', error);
      toast({
        title: "Error",
        description: "Failed to unlink service contract",
        variant: "destructive",
      });
    } finally {
      setIsUnlinking(false);
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

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Connected Service Contract</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {asset.service_contract_id && asset.service_contract ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Contract Title</p>
                    <p className="text-sm text-gray-600">{asset.service_contract.contract_title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vendor</p>
                    <p className="text-sm text-gray-600">{asset.service_contract.vendor_name}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={getStatusColor(asset.service_contract.status)} variant="secondary">
                      {asset.service_contract.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-gray-600">{formatDate(asset.service_contract.end_date)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContractModalOpen(true)}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Contract Details
                </Button>
                
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isUnlinking}
                      >
                        <Unlink className="w-4 h-4 mr-1" />
                        Unlink Contract
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unlink Service Contract</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to unlink this service contract from the asset? 
                          This action will remove the association but will not delete the contract itself.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleUnlinkContract}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isUnlinking}
                        >
                          {isUnlinking ? "Unlinking..." : "Unlink Contract"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <h3 className="text-sm font-medium mb-2">No Service Contract</h3>
              <p className="text-muted-foreground text-xs mb-3">
                This asset is not currently linked to any service contract.
              </p>
              <Button
                onClick={() => setIsAddContractModalOpen(true)}
                size="sm"
                className="rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Link Existing Contract
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {asset.service_contract_id && asset.service_contract && (
        <ContractDetailModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          contract={asset.service_contract as any}
        />
      )}

      <ServiceContractSelectorModal
        isOpen={isAddContractModalOpen}
        onClose={() => setIsAddContractModalOpen(false)}
        assetId={asset.id}
        onContractLinked={onUpdate}
      />
    </>
  );
};
