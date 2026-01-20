import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Download, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';
import { generateAssetQRLabelPDF, downloadPDF } from '@/utils/qrCodeLabelUtils';

interface PrintQRLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetTag: string;
  assetName: string;
}

// 50mm x 25mm Zebra label configuration
const LABEL_CONFIG = {
  qrSize: 60,
  width: 50,
  height: 25,
  fontSize: { tag: '8pt', name: '6pt' },
};

export const PrintQRLabelModal: React.FC<PrintQRLabelModalProps> = ({
  isOpen,
  onClose,
  assetTag,
  assetName,
}) => {
  const [includeAssetName, setIncludeAssetName] = useState(true);
  const [copies, setCopies] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const getQRCodeDataUrl = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!qrRef.current) {
        resolve('');
        return;
      }

      const svg = qrRef.current.querySelector('svg');
      if (!svg) {
        resolve('');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  }, []);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await getQRCodeDataUrl();
      const doc = await generateAssetQRLabelPDF(
        { assetTag, assetName },
        qrDataUrl,
        includeAssetName,
        copies
      );
      downloadPDF(doc, `${assetTag}-label.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserPrint = () => {
    const qrSvg = qrRef.current?.querySelector('svg');
    const svgString = qrSvg ? new XMLSerializer().serializeToString(qrSvg) : '';
    
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Label - ${assetTag}</title>
          <style>
            @page { 
              size: ${LABEL_CONFIG.width}mm ${LABEL_CONFIG.height}mm; 
              margin: 0; 
            }
            @media print {
              html, body {
                width: ${LABEL_CONFIG.width}mm;
                height: ${LABEL_CONFIG.height}mm;
                margin: 0;
                padding: 0;
              }
            }
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              margin: 0;
              padding: 1mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label { 
              display: flex; 
              flex-direction: row; 
              align-items: center; 
              justify-content: center;
              gap: 2mm;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              page-break-after: always;
            }
            .label:last-child { page-break-after: avoid; }
            .qr-code svg { width: 20mm; height: 20mm; }
            .text-content {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
            }
            .asset-tag { 
              font-weight: bold; 
              font-family: 'Courier New', monospace; 
              font-size: ${LABEL_CONFIG.fontSize.tag}; 
              letter-spacing: 0.5px;
            }
            .asset-name { 
              color: #000; 
              font-size: ${LABEL_CONFIG.fontSize.name}; 
              margin-top: 0.5mm; 
              max-width: 25mm; 
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          ${Array(copies).fill(`
            <div class="label">
              <div class="qr-code">${svgString}</div>
              <div class="text-content">
                <div class="asset-tag">${assetTag}</div>
                ${includeAssetName && assetName ? `<div class="asset-name">${assetName}</div>` : ''}
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() { 
              window.print(); 
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Print QR Code Label</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview - horizontal layout matching 50x25mm */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
              <div ref={qrRef}>
                <QRCode
                  value={assetTag}
                  size={LABEL_CONFIG.qrSize}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-mono font-bold text-sm">{assetTag}</p>
                {includeAssetName && assetName && (
                  <p className="text-muted-foreground text-xs max-w-[100px] truncate">
                    {assetName}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                max={50}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-16 h-8 text-center text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button size="sm" onClick={handleBrowserPrint} disabled={isGenerating}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
