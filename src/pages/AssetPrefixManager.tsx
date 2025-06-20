
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { AssetPrefixList } from '@/components/asset-prefixes/AssetPrefixList';
import { AssetPrefixForm } from '@/components/asset-prefixes/AssetPrefixForm';
import { useAssetPrefixes } from '@/hooks/useAssetPrefixes';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

const AssetPrefixManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrefix, setEditingPrefix] = useState<AssetTagPrefix | null>(null);
  
  const { prefixes, isLoading, refetch, deletePrefix } = useAssetPrefixes();

  const handleCreatePrefix = () => {
    setEditingPrefix(null);
    setIsFormOpen(true);
  };

  const handleEditPrefix = (prefix: AssetTagPrefix) => {
    setEditingPrefix(prefix);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPrefix(null);
    refetch();
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
              <Settings className="h-6 w-6 text-primary" />
              <span>Asset Tag Prefix Manager</span>
            </CardTitle>
            <Button onClick={handleCreatePrefix} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Prefix
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AssetPrefixList
            prefixes={prefixes}
            onEditPrefix={handleEditPrefix}
            onDeletePrefix={deletePrefix}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <AssetPrefixForm
          prefix={editingPrefix}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPrefix(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default AssetPrefixManager;
