import React, { useState } from 'react';
import { ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ScanResultDialog } from './ScanResultDialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MatchedAsset {
  id: string;
  name: string;
}

interface MatchedPart {
  id: string;
  name: string;
}

export const BarcodeScanFAB: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [disambiguationOpen, setDisambiguationOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [matchedAsset, setMatchedAsset] = useState<MatchedAsset | null>(null);
  const [matchedPart, setMatchedPart] = useState<MatchedPart | null>(null);
  const navigate = useNavigate();

  const handleScan = async (code: string) => {
    try {
      // Query both assets and inventory parts in parallel
      const [assetResult, inventoryResult] = await Promise.all([
        supabase
          .from('assets')
          .select('id, name, asset_tag')
          .eq('asset_tag', code)
          .maybeSingle(),
        supabase
          .from('inventory_parts')
          .select('id, name, sku')
          .eq('sku', code)
          .maybeSingle()
      ]);

      if (assetResult.error) throw assetResult.error;
      if (inventoryResult.error) throw inventoryResult.error;

      const asset = assetResult.data;
      const part = inventoryResult.data;

      if (asset && part) {
        // Both found - show disambiguation dialog
        setScannedCode(code);
        setMatchedAsset({ id: asset.id, name: asset.name });
        setMatchedPart({ id: part.id, name: part.name });
        setDisambiguationOpen(true);
      } else if (asset) {
        toast({
          title: "Asset Found",
          description: `Opening: ${asset.name}`,
        });
        navigate(`/assets?asset=${asset.id}`);
      } else if (part) {
        toast({
          title: "Inventory Part Found",
          description: `Opening: ${part.name}`,
        });
        navigate(`/inventory/${part.id}`);
      } else {
        toast({
          title: "Not Found",
          description: `No asset or inventory part found with code: ${code}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error looking up code:', error);
      toast({
        title: "Lookup Error",
        description: "Failed to look up code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAsset = () => {
    if (matchedAsset) {
      setDisambiguationOpen(false);
      navigate(`/assets?asset=${matchedAsset.id}`);
    }
  };

  const handleSelectPart = () => {
    if (matchedPart) {
      setDisambiguationOpen(false);
      navigate(`/inventory/${matchedPart.id}`);
    }
  };

  const handleCloseDisambiguation = () => {
    setDisambiguationOpen(false);
    setMatchedAsset(null);
    setMatchedPart(null);
    setScannedCode('');
  };

  return (
    <>
      <Button
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 p-0"
        size="icon"
        aria-label="Scan barcode"
      >
        <ScanBarcode className="h-6 w-6" />
      </Button>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />

      <ScanResultDialog
        isOpen={disambiguationOpen}
        onClose={handleCloseDisambiguation}
        scannedCode={scannedCode}
        asset={matchedAsset || undefined}
        part={matchedPart || undefined}
        onSelectAsset={handleSelectAsset}
        onSelectPart={handleSelectPart}
      />
    </>
  );
};
