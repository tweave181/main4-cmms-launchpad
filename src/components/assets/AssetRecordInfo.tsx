
import React from 'react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Asset } from './types';

interface AssetRecordInfoProps {
  asset: Asset;
}

export const AssetRecordInfo: React.FC<AssetRecordInfoProps> = ({ asset }) => {
  const { formatDate } = useGlobalSettings();
  return (
    <div className="text-sm text-muted-foreground">
      <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
        <span>Record Information</span>
        <span>Created At: {formatDate(asset.created_at)}</span>
        <span>Last Updated: {formatDate(asset.updated_at)}</span>
      </span>
    </div>
  );
};
