import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Asset {
  id: string;
  name: string;
  asset_tag?: string;
  location?: string;
}

interface AssetSingleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  selectedAssetId?: string;
}

export const AssetSingleSelector: React.FC<AssetSingleSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedAssetId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string>(selectedAssetId || '');
  const { userProfile } = useAuth();

  useEffect(() => {
    setSelectedId(selectedAssetId || '');
  }, [selectedAssetId]);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets-selector', userProfile?.tenant_id, searchTerm],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];

      let query = supabase
        .from('assets')
        .select('id, name, asset_tag, location')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('status', 'active');

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,asset_tag.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('name')
        .limit(50);

      if (error) throw error;
      return data as Asset[];
    },
    enabled: isOpen && !!userProfile?.tenant_id,
  });

  const handleSelect = () => {
    const selectedAsset = assets.find(asset => asset.id === selectedId);
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  const handleAssetClick = (assetId: string) => {
    setSelectedId(assetId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Asset List */}
          <ScrollArea className="h-[400px] border rounded-md">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : assets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'No assets found matching your search' : 'No assets available'}
              </div>
            ) : (
              <div className="p-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`
                      p-3 rounded-md cursor-pointer transition-colors
                      ${selectedId === asset.id 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'hover:bg-muted border-2 border-transparent'
                      }
                    `}
                    onClick={() => handleAssetClick(asset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{asset.name}</h4>
                          {asset.asset_tag && (
                            <Badge variant="outline" className="text-xs">
                              {asset.asset_tag}
                            </Badge>
                          )}
                        </div>
                        {asset.location && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {asset.location}
                          </p>
                        )}
                      </div>
                      {selectedId === asset.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelect}
              disabled={!selectedId}
            >
              Select Asset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};