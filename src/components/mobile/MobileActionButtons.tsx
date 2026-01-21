
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Mic, ScanBarcode } from 'lucide-react';
import { MobileUtils } from '@/utils/mobileUtils';
import { toast } from '@/components/ui/use-toast';
import { BarcodeScannerModal } from '@/components/barcode/BarcodeScannerModal';

interface MobileActionButtonsProps {
  onPhotoCapture?: (file: File) => void;
  onVoiceTranscript?: (text: string) => void;
  onBarcodeScanned?: (code: string) => void;
  showCamera?: boolean;
  showVoice?: boolean;
  showBarcode?: boolean;
}

export const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({
  onPhotoCapture,
  onVoiceTranscript,
  onBarcodeScanned,
  showCamera = true,
  showVoice = true,
  showBarcode = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handlePhotoCapture = async () => {
    if (!await MobileUtils.hasCamera()) {
      toast({
        title: "Camera Not Available",
        description: "Camera access is not available on this device.",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    try {
      const file = await MobileUtils.capturePhoto();
      if (file && onPhotoCapture) {
        onPhotoCapture(file);
        toast({
          title: "Photo Captured",
          description: "Photo has been added to the work order.",
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
    setIsCapturing(false);
  };

  const handleVoiceRecording = async () => {
    if (!MobileUtils.hasSpeechRecognition()) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Speech recognition is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    setIsRecording(true);
    try {
      const transcript = await MobileUtils.startVoiceRecording();
      if (transcript && onVoiceTranscript) {
        onVoiceTranscript(transcript);
        toast({
          title: "Voice Recorded",
          description: "Voice has been converted to text.",
        });
      }
    } catch (error) {
      toast({
        title: "Voice Recognition Error",
        description: "Failed to record voice. Please try again.",
        variant: "destructive",
      });
    }
    setIsRecording(false);
  };

  const handleBarcodeScanned = (code: string) => {
    if (onBarcodeScanned) {
      onBarcodeScanned(code);
      toast({
        title: "Barcode Scanned",
        description: `Scanned: ${code}`,
      });
    }
  };

  return (
    <>
      <div className="flex space-x-2 p-2">
        {showCamera && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePhotoCapture}
            disabled={isCapturing}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-1" />
            {isCapturing ? 'Capturing...' : 'Photo'}
          </Button>
        )}
        
        {showVoice && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceRecording}
            disabled={isRecording}
            className="flex-1"
          >
            <Mic className="h-4 w-4 mr-1" />
            {isRecording ? 'Recording...' : 'Voice'}
          </Button>
        )}
        
        {showBarcode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScannerOpen(true)}
            className="flex-1"
          >
            <ScanBarcode className="h-4 w-4 mr-1" />
            Scan Barcode
          </Button>
        )}
      </div>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </>
  );
};
