
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Calendar, DollarSign, MapPin, Hash, Package, Building } from 'lucide-react';
import { AssetWorkOrders } from './AssetWorkOrders';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetDetailProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {asset.name}
            </DialogTitle>
            <Button onClick={onEdit} className="rounded-2xl">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Asset
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getStatusColor(asset.status)} variant="secondary">
              Status: {asset.status}
            </Badge>
            <Badge className={getPriorityColor(asset.priority)} variant="secondary">
              Priority: {asset.priority}
            </Badge>
          </div>

          {/* Work Orders Section */}
          <AssetWorkOrders assetId={asset.id} />

          {/* Basic Information */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asset.asset_tag && (
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Asset Tag</p>
                    <p className="text-sm text-gray-600">{asset.asset_tag}</p>
                  </div>
                </div>
              )}
              
              {asset.category && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-gray-600">{asset.category}</p>
                  </div>
                </div>
              )}

              {asset.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-gray-600">{asset.location}</p>
                  </div>
                </div>
              )}

              {asset.manufacturer && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Manufacturer</p>
                    <p className="text-sm text-gray-600">{asset.manufacturer}</p>
                  </div>
                </div>
              )}

              {asset.model && (
                <div>
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm text-gray-600">{asset.model}</p>
                </div>
              )}

              {asset.serial_number && (
                <div>
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-gray-600">{asset.serial_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Financial Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Purchase Cost</p>
                  <p className="text-sm text-gray-600">{formatCurrency(asset.purchase_cost)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Purchase Date</p>
                  <p className="text-sm text-gray-600">{formatDate(asset.purchase_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Warranty Expiry</p>
                  <p className="text-sm text-gray-600">{formatDate(asset.warranty_expiry)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {asset.description && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{asset.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Created At</p>
                <p className="text-sm text-gray-600">
                  {new Date(asset.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-gray-600">
                  {new Date(asset.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
