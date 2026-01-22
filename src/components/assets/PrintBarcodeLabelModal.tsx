import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Download, Printer } from 'lucide-react';
import Barcode from 'react-barcode';
import { generateAssetBarcodeLabelPDF, downloadPDF } from '@/utils/barcodeLabelUtils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PrintBarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetTag: string;
  assetName: string;
  assetId: string;
  barcodePrintedAt?: string | null;
  onPrinted?: () => void;
}

// 50mm x 25mm Zebra label configuration
const LABEL_CONFIG = {
  barcodeWidth: 1.8,   // Preview barcode bar width (increased)
  barcodeHeight: 50,   // Preview barcode height in pixels (increased)
  printBarcodeWidth: 45, // Print barcode width in mm
  printBarcodeHeight: 12, // Print barcode height in mm (increased from 10)
  width: 50,
  height: 25,
  fontSize: { tag: '10pt', name: '7pt' },
};

export const PrintBarcodeLabelModal: React.FC<PrintBarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  assetTag,
  assetName,
  assetId,
  barcodePrintedAt,
  onPrinted,
}) => {
  const [includeAssetName, setIncludeAssetName] = useState(true);
  const [copies, setCopies] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReprintConfirm, setShowReprintConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'print' | 'download' | null>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const getBarcodeDataUrl = useCallback(async (): Promise<string> => {
    const barcodeContainer = barcodeRef.current;
    if (!barcodeContainer) {
      throw new Error('Barcode container not found');
    }

    const svgElement = barcodeContainer.querySelector('svg');
    if (!svgElement) {
      throw new Error('Barcode SVG not found');
    }

    // Clone and serialize SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    // Convert to data URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load barcode image'));
      };
      img.src = url;
    });
  }, []);

  const updateBarcodePrintedAt = async () => {
    if (!barcodePrintedAt) {
      // Only update if this is the first time printing
      // Cast needed because types file is auto-generated and may not include new column yet
      await supabase
        .from('assets')
        .update({ barcode_printed_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', assetId);
      onPrinted?.();
    }
  };

  const handleDownloadAction = async () => {
    setIsGenerating(true);
    try {
      const barcodeDataUrl = await getBarcodeDataUrl();
      const doc = await generateAssetBarcodeLabelPDF(
        { assetTag, assetName },
        barcodeDataUrl,
        includeAssetName,
        copies
      );
      downloadPDF(doc, `${assetTag.replace(/\//g, '-')}-label.pdf`);
      await updateBarcodePrintedAt();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (barcodePrintedAt) {
      setPendingAction('download');
      setShowReprintConfirm(true);
    } else {
      handleDownloadAction();
    }
  };

  const handleBrowserPrintAction = async () => {
    const barcodeContainer = barcodeRef.current;
    if (!barcodeContainer) return;

    const svgElement = barcodeContainer.querySelector('svg');
    if (!svgElement) return;

    const svgClone = svgElement.cloneNode(true) as SVGElement;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    // Generate labels HTML
    const labelsHtml = Array(copies).fill(null).map(() => `
      <div class="label">
        <div class="text-content">
          <span class="asset-tag">${assetTag}</span>
          ${includeAssetName && assetName ? `<span class="asset-name">${assetName}</span>` : ''}
        </div>
        <div class="barcode">${svgString}</div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      alert('Please allow pop-ups to print labels');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Label - ${assetTag}</title>
          <style>
            @page { 
              size: ${LABEL_CONFIG.width}mm ${LABEL_CONFIG.height}mm landscape; 
              margin: 0; 
            }
            @media print {
              @page { 
                size: ${LABEL_CONFIG.width}mm ${LABEL_CONFIG.height}mm landscape; 
                margin: 0; 
              }
              html, body {
                width: ${LABEL_CONFIG.width}mm !important;
                height: ${LABEL_CONFIG.height}mm !important;
                overflow: hidden !important;
              }
              .label {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: ${LABEL_CONFIG.width}mm;
              height: ${LABEL_CONFIG.height}mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              padding: 2mm;
              gap: 1mm;
              width: ${LABEL_CONFIG.width}mm;
              height: ${LABEL_CONFIG.height}mm;
              box-sizing: border-box;
              page-break-inside: avoid;
              page-break-after: always;
            }
            .label:last-child { page-break-after: avoid; }
            .text-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 0.5mm;
            }
            .barcode { flex-shrink: 0; }
            .barcode svg { 
              width: ${LABEL_CONFIG.printBarcodeWidth}mm; 
              height: ${LABEL_CONFIG.printBarcodeHeight}mm; 
            }
            .asset-tag { 
              font-weight: bold; 
              font-family: monospace;
              color: #000; 
              font-size: ${LABEL_CONFIG.fontSize.tag}; 
            }
            .asset-name { 
              color: #000; 
              font-size: ${LABEL_CONFIG.fontSize.name}; 
              max-width: 45mm; 
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>${labelsHtml}</body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };

    await updateBarcodePrintedAt();
  };

  const handleBrowserPrint = () => {
    if (barcodePrintedAt) {
      setPendingAction('print');
      setShowReprintConfirm(true);
    } else {
      handleBrowserPrintAction();
    }
  };

  const handleConfirmReprint = () => {
    setShowReprintConfirm(false);
    if (pendingAction === 'print') {
      handleBrowserPrintAction();
    } else if (pendingAction === 'download') {
      handleDownloadAction();
    }
    setPendingAction(null);
  };

  const handleCancelReprint = () => {
    setShowReprintConfirm(false);
    setPendingAction(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xs sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Print Bar Code Label</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border shadow-sm">
                <p className="font-mono font-bold text-sm">{assetTag}</p>
                <div ref={barcodeRef} id="barcode-container">
                  <Barcode
                    value={assetTag}
                    format="CODE128"
                    width={LABEL_CONFIG.barcodeWidth}
                    height={LABEL_CONFIG.barcodeHeight}
                    displayValue={false}
                    background="#FFFFFF"
                    lineColor="#000000"
                  />
                </div>
                {includeAssetName && assetName && (
                  <p className="text-muted-foreground text-xs text-center max-w-[180px] truncate">
                    {assetName}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              50mm × 25mm Zebra Label
            </p>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-name" className="text-sm">Include Asset Name</Label>
                <Switch
                  id="include-name"
                  checked={includeAssetName}
                  onCheckedChange={setIncludeAssetName}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="copies" className="text-sm">Number of Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min={1}
                  max={100}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={handleBrowserPrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReprintConfirm} onOpenChange={setShowReprintConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprint Bar Code Label?</AlertDialogTitle>
            <AlertDialogDescription>
              A bar code label was already printed for this asset on{' '}
              <strong>{barcodePrintedAt ? format(new Date(barcodePrintedAt), 'dd MMM yyyy, HH:mm') : ''}</strong>.
              Do you want to print it again?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReprint}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReprint}>Print Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
