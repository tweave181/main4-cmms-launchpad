
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Plus } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { AssetSearchAndFilters } from './assets/components/AssetSearchAndFilters';
import { AssetTable } from '@/components/assets/AssetTable';
import { AssetEmptyState } from './assets/components/AssetEmptyState';
import { MobileActionButtons } from '@/components/mobile/MobileActionButtons';
import { useOfflineAssets } from '@/hooks/useOfflineAssets';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

const Assets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const { assets, isLoading, isOffline, refetch, deleteAsset } = useOfflineAssets();

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const handleQRScanned = (code: string) => {
    // Search for asset by QR code
    const foundAsset = assets.find(asset => 
      asset.asset_tag === code || 
      asset.name.toLowerCase().includes(code.toLowerCase())
    );
    
    if (foundAsset) {
      handleViewAsset(foundAsset);
    } else {
      setSearchTerm(code);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Tag className="h-6 w-6 text-primary" />
              <span>Asset Management</span>
              {isOffline && <span className="text-sm text-orange-600">(Offline)</span>}
            </CardTitle>
            <Button onClick={handleCreateAsset} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AssetSearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Mobile QR scanning for assets */}
          <div className="md:hidden mb-4">
            <MobileActionButtons
              onQRScanned={handleQRScanned}
              showCamera={false}
              showVoice={false}
              showQR={true}
            />
          </div>

          {filteredAssets.length === 0 ? (
            <AssetEmptyState
              searchTerm={searchTerm}
              onCreateAsset={handleCreateAsset}
            />
          ) : (
            <AssetTable
              assets={filteredAssets}
              onViewAsset={handleViewAsset}
              onEditAsset={handleEditAsset}
              onDeleteAsset={deleteAsset}
            />
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAsset(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingAsset(null);
            refetch();
          }}
        />
      )}

      {isDetailOpen && selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedAsset(null);
          }}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEditAsset(selectedAsset);
          }}
        />
      )}
    </div>
  );
};

export default Assets;
