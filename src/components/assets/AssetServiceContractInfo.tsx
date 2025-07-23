
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { ContractDetailModal } from '@/components/contracts/ContractDetailModal';
import { ServiceContractModal } from '@/components/contracts/ServiceContractModal';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'] & {
  service_contract?: {
    id: string;
    contract_title: string;
    vendor_name: string;
    status: string;
    end_date: string;
  } | null;
};

interface AssetServiceContractInfoProps {
  asset: Asset;
}

export const AssetServiceContractInfo: React.FC<AssetServiceContractInfoProps> = ({
  asset,
}) => {
  const { formatDate } = useGlobalSettings();
  const [isContractModalOpen, setIsContractModalOpen] = React.useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = React.useState(false);

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
          {asset.service_contract ? (
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

              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContractModalOpen(true)}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Contract Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Service Contract</h3>
              <p className="text-muted-foreground mb-4">
                This asset is not currently linked to any service contract.
              </p>
              <Button
                onClick={() => setIsAddContractModalOpen(true)}
                className="rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service Contract
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {asset.service_contract && (
        <ContractDetailModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          contract={asset.service_contract as any}
        />
      )}

      <ServiceContractModal
        isOpen={isAddContractModalOpen}
        onClose={() => setIsAddContractModalOpen(false)}
        assetId={asset.id}
      />
    </>
  );
};
