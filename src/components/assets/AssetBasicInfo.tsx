
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, Package, MapPin, Building, Building2, Barcode, Wrench } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { useCompanies } from '@/hooks/useCompanies';
import type { Asset } from './types';

interface AssetBasicInfoProps {
  asset: Asset;
}

export const AssetBasicInfo: React.FC<AssetBasicInfoProps> = ({ asset }) => {
const { departments } = useDepartments();
const department = departments.find(d => d.id === asset.department_id);
const { data: companies = [] } = useCompanies();
const manufacturerCompany = companies.find(c => c.id === (asset as any).manufacturer_company_id);
 
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {asset.parent && (
          <div className="flex items-center space-x-2 md:col-span-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Parent Asset</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{asset.parent.name}</p>
                {asset.parent.asset_tag && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                    {asset.parent.asset_tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Asset Tag</p>
            <p className="text-sm text-muted-foreground">
              {asset.asset_tag || <span className="italic">Not assigned</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Category</p>
            <p className="text-sm text-muted-foreground">
              {asset.category || <span className="italic">Not specified</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Location</p>
            <div className="flex items-center gap-2 flex-wrap">
              {typeof asset.location === 'object' && asset.location?.location_code && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                  {asset.location.location_code}
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                {typeof asset.location === 'object' 
                  ? (asset.location?.name || <span className="italic">Not specified</span>)
                  : (asset.location || <span className="italic">Not specified</span>)}
              </p>
              {typeof asset.location === 'object' && asset.location?.location_level_data && (
                <Badge variant="outline" className="text-xs">
                  {asset.location.location_level_data.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Department</p>
            <p className="text-sm text-muted-foreground">
              {department?.name || <span className="italic">Not assigned</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Manufacturer</p>
            <p className="text-sm text-muted-foreground">
              {manufacturerCompany?.company_name ?? asset.manufacturer ?? <span className="italic">Not specified</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Model</p>
            <p className="text-sm text-muted-foreground">
              {asset.model || <span className="italic">Not specified</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Barcode className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Serial Number</p>
            <p className="text-sm text-muted-foreground">
              {asset.serial_number || <span className="italic">Not recorded</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
