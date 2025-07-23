
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetDetailHeaderProps {
  asset: Asset;
  onEdit: () => void;
}

export const AssetDetailHeader: React.FC<AssetDetailHeaderProps> = ({
  asset,
  onEdit,
}) => {
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

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-semibold">
            Asset Record For: {asset.name}
          </DialogTitle>
          <Button onClick={onEdit} className="rounded-2xl">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Asset
          </Button>
        </div>
      </DialogHeader>

      <div className="flex flex-wrap gap-3">
        <Badge className={getStatusColor(asset.status)} variant="secondary">
          Status: {asset.status}
        </Badge>
        <Badge className={getPriorityColor(asset.priority)} variant="secondary">
          Priority: {asset.priority}
        </Badge>
      </div>
    </>
  );
};
