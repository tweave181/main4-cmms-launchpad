import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';
type Asset = Database['public']['Tables']['assets']['Row'];
interface AssetDescriptionSectionProps {
  asset: Asset;
}
export const AssetDescriptionSection: React.FC<AssetDescriptionSectionProps> = ({
  asset
}) => {
  if (!asset.description && !asset.notes) {
    return null;
  }
  return <>
      {asset.description && <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Description:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{asset.description}</p>
          </CardContent>
        </Card>}

      {asset.notes && <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Notes:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
          </CardContent>
        </Card>}
    </>;
};