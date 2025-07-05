
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetCardProps {
  asset: Asset;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onView,
  onEdit,
  onDelete,
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
    <Card className="rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
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
              onClick={() => onView(asset)}
              className="p-1 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(asset)}
              className="p-1 h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(asset.id)}
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
          {(asset as any).location && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Location:</p>
              {(asset as any).location.location_code && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                  {(asset as any).location.location_code}
                </span>
              )}
              <span className="text-sm text-gray-600">{(asset as any).location.name}</span>
            </div>
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
  );
};
