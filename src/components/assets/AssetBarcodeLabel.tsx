import React from 'react';
import Barcode from 'react-barcode';

interface AssetBarcodeLabelProps {
  assetTag: string;
  assetName: string;
  includeAssetName?: boolean;
}

export const AssetBarcodeLabel: React.FC<AssetBarcodeLabelProps> = ({
  assetTag,
  assetName,
  includeAssetName = true,
}) => {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border">
      <p className="font-mono font-bold text-sm text-foreground">{assetTag}</p>
      <div id="barcode-container">
        <Barcode 
          value={assetTag}
          format="CODE128"
          width={1.5}
          height={40}
          displayValue={false}
          background="#FFFFFF"
          lineColor="#000000"
        />
      </div>
      {includeAssetName && assetName && (
        <p className="text-muted-foreground text-xs text-center max-w-[200px] truncate">
          {assetName}
        </p>
      )}
    </div>
  );
};
