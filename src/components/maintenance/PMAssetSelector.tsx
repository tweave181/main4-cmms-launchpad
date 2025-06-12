
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Asset {
  id: string;
  name: string;
  asset_tag?: string;
  location?: string;
}

interface PMAssetSelectorProps {
  selectedAssetIds: string[];
  onSelectionChange: (assetIds: string[]) => void;
}

export const PMAssetSelector: React.FC<PMAssetSelectorProps> = ({
  selectedAssetIds,
  onSelectionChange,
}) => {
  const { userProfile } = useAuth();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets-for-pm'],
    queryFn: async (): Promise<Asset[]> => {
      console.log('Fetching assets for PM selector...');
      
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, asset_tag, location')
        .eq('tenant_id', userProfile?.tenant_id)
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching assets:', error);
        throw error;
      }

      console.log('Assets fetched for PM selector:', data);
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const handleAssetToggle = (assetId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAssetIds, assetId]);
    } else {
      onSelectionChange(selectedAssetIds.filter(id => id !== assetId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
        No active assets available. Create assets first to add them to maintenance schedules.
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 border rounded-lg p-4">
      <div className="space-y-3">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center space-x-3">
            <Checkbox
              id={asset.id}
              checked={selectedAssetIds.includes(asset.id)}
              onCheckedChange={(checked) => 
                handleAssetToggle(asset.id, checked as boolean)
              }
            />
            <label
              htmlFor={asset.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              <div className="flex justify-between items-center">
                <span>{asset.name}</span>
                <div className="text-xs text-muted-foreground">
                  {asset.asset_tag && (
                    <span className="mr-2">#{asset.asset_tag}</span>
                  )}
                  {asset.location && <span>{asset.location}</span>}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
