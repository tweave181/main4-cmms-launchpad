
import React, { useState } from 'react';
import { ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const BarcodeScanFAB: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (code: string) => {
    try {
      // Look up asset by asset_tag
      const { data: asset, error } = await supabase
        .from('assets')
        .select('id, name, asset_tag')
        .eq('asset_tag', code)
        .maybeSingle();

      if (error) throw error;

      if (asset) {
        toast({
          title: "Asset Found",
          description: `Opening: ${asset.name}`,
        });
        // Navigate to assets page with the asset selected
        navigate(`/assets?asset=${asset.id}`);
      } else {
        toast({
          title: "Asset Not Found",
          description: `No asset found with tag: ${code}`,
          variant: "destructive",
        });
        // Navigate to assets page with the search term
        navigate(`/assets?search=${encodeURIComponent(code)}`);
      }
    } catch (error) {
      console.error('Error looking up asset:', error);
      toast({
        title: "Lookup Error",
        description: "Failed to look up asset. Please try again.",
        variant: "destructive",
      });
    }
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
    </>
  );
};
