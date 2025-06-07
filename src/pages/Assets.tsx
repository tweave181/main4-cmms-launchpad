
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Search, Filter, Eye, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AssetForm } from '@/components/assets/AssetForm';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

const Assets: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const { data: assets, isLoading, refetch } = useQuery({
    queryKey: ['assets', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const filteredAssets = assets?.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'disposed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            </CardTitle>
            <Button onClick={handleCreateAsset} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
            <Button variant="outline" className="rounded-2xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{asset.name}</h3>
                      {asset.asset_tag && (
                        <p className="text-sm text-gray-600">Tag: {asset.asset_tag}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewAsset(asset)}
                        className="p-1 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAsset(asset)}
                        className="p-1 h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {asset.category && (
                      <p className="text-sm text-gray-600">Category: {asset.category}</p>
                    )}
                    {asset.location && (
                      <p className="text-sm text-gray-600">Location: {asset.location}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                      <Badge className={getPriorityColor(asset.priority)}>
                        {asset.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first asset.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateAsset} className="rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              )}
            </div>
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
