
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetRecordInfoProps {
  asset: Asset;
}

export const AssetRecordInfo: React.FC<AssetRecordInfoProps> = ({ asset }) => {
  const { formatDate } = useGlobalSettings();
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Record Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Created At</p>
          <p className="text-sm text-gray-600">
            {formatDate(asset.created_at)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Last Updated</p>
          <p className="text-sm text-gray-600">
            {formatDate(asset.updated_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
