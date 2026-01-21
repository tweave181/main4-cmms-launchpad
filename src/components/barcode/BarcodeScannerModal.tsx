import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>('barcode-scanner-container');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen) {
      // Wait for Dialog to render before starting scanner
      timer = setTimeout(() => {
        startScanner();
      }, 150);
    }

    return () => {
      if (timer) clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setError(null);
    setIsInitializing(true);

    try {
      // Create scanner instance
      scannerRef.current = new Html5Qrcode(containerRef.current);

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 100 }, // Horizontal box optimized for barcodes
        formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
        aspectRatio: 1.777, // 16:9
      };

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        config,
        (decodedText) => {
          // Successfully scanned
          handleSuccessfulScan(decodedText);
        },
        () => {
          // QR code not found - ignore, keep scanning
        }
      );

      setIsInitializing(false);
    } catch (err) {
      setIsInitializing(false);
      console.error('Scanner error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('NotAllowedError') || err.message.includes('Permission')) {
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (err.message.includes('NotFoundError')) {
          setError('No camera found on this device.');
        } else {
          setError(`Failed to start scanner: ${err.message}`);
        }
      } else {
        setError('Failed to start camera scanner. Please check permissions.');
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  const handleSuccessfulScan = async (code: string) => {
    // Stop scanner first
    await stopScanner();
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Return the scanned code
    onScan(code);
    onClose();
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
          <DialogDescription>
            Point your camera at the asset barcode label
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {isInitializing && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Starting camera...</span>
                </div>
              )}
              
              <div 
                id={containerRef.current}
                className="w-full rounded-lg overflow-hidden bg-black"
                style={{ minHeight: isInitializing ? '0' : '240px' }}
              />
              
              <p className="text-sm text-muted-foreground text-center">
                Point your camera at the asset barcode label
              </p>
            </>
          )}

          <div className="flex justify-center gap-3">
            {error && (
              <Button variant="outline" size="lg" onClick={startScanner} className="flex-1">
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleClose}
              className="flex-1 min-h-[48px] text-base font-medium"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

