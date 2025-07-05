
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Package, MapPin, Building, Building2 } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetBasicInfoProps {
  asset: Asset;
}

export const AssetBasicInfo: React.FC<AssetBasicInfoProps> = ({ asset }) => {
  const { departments } = useDepartments();
  const department = departments.find(d => d.id === asset.department_id);

  return (
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

        {(asset as any).location && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <div className="flex items-center gap-1">
                {(asset as any).location.location_code && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                    {(asset as any).location.location_code}
                  </span>
                )}
                <p className="text-sm text-gray-600">{(asset as any).location.name}</p>
              </div>
            </div>
          </div>
        )}

        {department && (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-gray-600">{department.name}</p>
            </div>
          </div>
        )}

        {asset.manufacturer && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
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
  );
};
