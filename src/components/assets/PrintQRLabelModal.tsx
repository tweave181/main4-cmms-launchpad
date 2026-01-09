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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type LabelSize = 'small' | 'medium' | 'large';

const SIZE_CONFIGS = {
  small: { qrSize: 80, label: 'Small (50×30mm)' },
  medium: { qrSize: 120, label: 'Medium (70×40mm)' },
  large: { qrSize: 160, label: 'Large (100×60mm)' },
};

export const PrintQRLabelModal: React.FC<PrintQRLabelModalProps> = ({
  isOpen,
  onClose,
  assetTag,
  assetName,
}) => {
  const [labelSize, setLabelSize] = useState<LabelSize>('medium');
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
        labelSize,
        includeAssetName,
        copies
      );
      downloadPDF(doc, `${assetTag}-label.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const qrSvg = qrRef.current?.querySelector('svg');
    const svgString = qrSvg ? new XMLSerializer().serializeToString(qrSvg) : '';
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Label - ${assetTag}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .label { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              padding: 10mm;
              page-break-after: always;
            }
            .label:last-child { page-break-after: avoid; }
            .qr-code { margin-bottom: 5mm; }
            .qr-code svg { width: ${config.qrSize}px; height: ${config.qrSize}px; }
            .asset-tag { font-weight: bold; font-family: monospace; font-size: 14pt; }
            .asset-name { color: #666; font-size: 10pt; margin-top: 2mm; max-width: 180px; text-align: center; }
          </style>
        </head>
        <body>
          ${Array(copies).fill(`
            <div class="label">
              <div class="qr-code">${svgString}</div>
              <div class="asset-tag">${assetTag}</div>
              ${includeAssetName && assetName ? `<div class="asset-name">${assetName}</div>` : ''}
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

  const config = SIZE_CONFIGS[labelSize];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print QR Code Label</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border shadow-sm">
              <div ref={qrRef}>
                <QRCode
                  value={assetTag}
                  size={config.qrSize}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <p className="font-mono font-bold text-sm">{assetTag}</p>
              {includeAssetName && assetName && (
                <p className="text-muted-foreground text-xs text-center max-w-[180px] truncate">
                  {assetName}
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="label-size">Label Size</Label>
              <Select value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{SIZE_CONFIGS.small.label}</SelectItem>
                  <SelectItem value="medium">{SIZE_CONFIGS.medium.label}</SelectItem>
                  <SelectItem value="large">{SIZE_CONFIGS.large.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-name">Include Asset Name</Label>
              <Switch
                id="include-name"
                checked={includeAssetName}
                onCheckedChange={setIncludeAssetName}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="copies">Number of Copies</Label>
              <Input
                id="copies"
                type="number"
                min={1}
                max={50}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} disabled={isGenerating}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
