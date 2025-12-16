import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, TableProperties } from 'lucide-react';
import { useUnlinkedCategories } from '@/components/asset-prefixes/hooks/useUnlinkedCategories';
import { AssetPrefixList } from '@/components/asset-prefixes/AssetPrefixList';
import { AssetPrefixForm } from '@/components/asset-prefixes/AssetPrefixForm';
import { useAssetPrefixes } from '@/hooks/useAssetPrefixes';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

const AssetPrefixManager: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrefix, setEditingPrefix] = useState<AssetTagPrefix | null>(null);
  const {
    prefixes,
    isLoading,
    refetch,
    deletePrefix
  } = useAssetPrefixes();
  const {
    data: unlinkedCategories
  } = useUnlinkedCategories();

  const hasUnlinkedCategories = (unlinkedCategories?.length || 0) > 0;

  const handleCreatePrefix = () => {
    console.log('Create new prefix clicked');
    setEditingPrefix(null);
    setIsFormOpen(true);
  };

  const handleEditPrefix = (prefix: AssetTagPrefix) => {
    console.log('Edit prefix called with:', prefix);
    try {
      setEditingPrefix(prefix);
      setIsFormOpen(true);
      console.log('Edit form should now be open');
    } catch (error) {
      console.error('Error setting up edit form:', error);
      toast({
        title: 'Error',
        description: 'Failed to open edit form. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleFormSuccess = async () => {
    console.log('Form success callback triggered');
    setIsFormOpen(false);
    setEditingPrefix(null);
    try {
      await refetch();
      toast({
        title: 'Success',
        description: editingPrefix ? 'Asset tag prefix updated successfully' : 'Asset tag prefix created successfully'
      });
    } catch (error) {
      console.error('Error refreshing data after form success:', error);
      toast({
        title: 'Warning',
        description: 'Changes saved but failed to refresh the list. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const handleFormClose = () => {
    console.log('Form close callback triggered');
    setIsFormOpen(false);
    setEditingPrefix(null);
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
      <Card className="rounded-2xl shadow-sm border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary" />
              <span>Asset Tag Prefix Manager</span>
            </CardTitle>
            <div className="flex gap-2">
              {hasUnlinkedCategories && (
                <Button variant="outline" onClick={() => navigate('/admin/preferences/asset-prefixes/bulk')} className="rounded-2xl">
                  <TableProperties className="w-4 h-4 mr-2" />
                  Bulk Setup ({unlinkedCategories?.length})
                </Button>
              )}
              <Button onClick={handleCreatePrefix} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Prefix
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AssetPrefixList prefixes={prefixes} onEditPrefix={handleEditPrefix} onDeletePrefix={deletePrefix} />
        </CardContent>
      </Card>

      <AssetPrefixForm prefix={editingPrefix} isOpen={isFormOpen} onClose={handleFormClose} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default AssetPrefixManager;
