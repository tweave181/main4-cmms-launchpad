import React, { useState } from 'react';
import { ScanBarcode, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ScanResultDialog } from './ScanResultDialog';
import { QuickStockAdjustmentDialog } from './QuickStockAdjustmentDialog';
import { useQuickStockAdjustment } from './useQuickStockAdjustment';
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

interface StockAdjustmentPart {
  id: string;
  name: string;
  sku: string;
  quantity_in_stock: number;
  unit_of_measure: string;
}

type ScanMode = 'navigate' | 'add-stock';

export const BarcodeScanFAB: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('navigate');
  const [disambiguationOpen, setDisambiguationOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [matchedAsset, setMatchedAsset] = useState<MatchedAsset | null>(null);
  const [matchedPart, setMatchedPart] = useState<MatchedPart | null>(null);
  const [stockAdjustmentPart, setStockAdjustmentPart] = useState<StockAdjustmentPart | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const { adjustStock, isAdjusting } = useQuickStockAdjustment();
  const navigate = useNavigate();

  const handleOpenScanner = (mode: ScanMode) => {
    setScanMode(mode);
    setIsScannerOpen(true);
  };

  const handleScan = async (code: string) => {
    if (scanMode === 'add-stock') {
      await handleAddStockScan(code);
    } else {
      await handleNavigateScan(code);
    }
  };

  const handleNavigateScan = async (code: string) => {
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

  const handleAddStockScan = async (code: string) => {
    try {
      const { data: part, error } = await supabase
        .from('inventory_parts')
        .select('id, name, sku, quantity_in_stock, unit_of_measure')
        .eq('sku', code)
        .maybeSingle();

      if (error) throw error;

      if (part) {
        setStockAdjustmentPart(part);
        setStockDialogOpen(true);
      } else {
        toast({
          title: "Not Found",
          description: `No inventory part found with SKU: ${code}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error looking up inventory part:', error);
      toast({
        title: "Lookup Error",
        description: "Failed to look up inventory part. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStockAdjustmentConfirm = async (adjustment: {
    partId: string;
    transactionType: 'restock' | 'usage';
    quantityChange: number;
    quantityAfter: number;
    notes?: string;
  }) => {
    const success = await adjustStock(adjustment);
    if (success) {
      setStockDialogOpen(false);
      setStockAdjustmentPart(null);
    }
  };

  const handleCloseStockDialog = () => {
    setStockDialogOpen(false);
    setStockAdjustmentPart(null);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 p-0"
            size="icon"
            aria-label="Scan barcode"
          >
            <ScanBarcode className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuItem onClick={() => handleOpenScanner('navigate')}>
            <Package className="h-4 w-4 mr-2" />
            Scan to View Record
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenScanner('add-stock')}>
            <Plus className="h-4 w-4 mr-2" />
            Scan to Add Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
        mode={scanMode}
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

      <QuickStockAdjustmentDialog
        isOpen={stockDialogOpen}
        onClose={handleCloseStockDialog}
        part={stockAdjustmentPart}
        onConfirm={handleStockAdjustmentConfirm}
        isSubmitting={isAdjusting}
      />
    </>
  );
};
