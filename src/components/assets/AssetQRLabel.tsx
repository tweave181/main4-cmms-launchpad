import React from 'react';
import QRCode from 'react-qr-code';

interface AssetQRLabelProps {
  assetTag: string;
  assetName: string;
  size?: 'small' | 'medium' | 'large';
  includeAssetName?: boolean;
}

const SIZE_CONFIGS = {
  small: { qrSize: 80, tagSize: 'text-xs', nameSize: 'text-[10px]' },
  medium: { qrSize: 120, tagSize: 'text-sm', nameSize: 'text-xs' },
  large: { qrSize: 160, tagSize: 'text-base', nameSize: 'text-sm' },
};

export const AssetQRLabel: React.FC<AssetQRLabelProps> = ({
  assetTag,
  assetName,
  size = 'medium',
  includeAssetName = true,
}) => {
  const config = SIZE_CONFIGS[size];

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border">
      <div id="qr-code-container">
        <QRCode
          value={assetTag}
          size={config.qrSize}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      <p className={`font-mono font-bold ${config.tagSize}`}>{assetTag}</p>
      {includeAssetName && assetName && (
        <p className={`text-muted-foreground ${config.nameSize} text-center max-w-[200px] truncate`}>
          {assetName}
        </p>
      )}
    </div>
  );
};
