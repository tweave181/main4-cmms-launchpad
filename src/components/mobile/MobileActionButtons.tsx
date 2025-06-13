
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Mic, QrCode, Upload } from 'lucide-react';
import { MobileUtils } from '@/utils/mobileUtils';
import { toast } from '@/components/ui/use-toast';

interface MobileActionButtonsProps {
  onPhotoCapture?: (file: File) => void;
  onVoiceTranscript?: (text: string) => void;
  onQRScanned?: (code: string) => void;
  showCamera?: boolean;
  showVoice?: boolean;
  showQR?: boolean;
}

export const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({
  onPhotoCapture,
  onVoiceTranscript,
  onQRScanned,
  showCamera = true,
  showVoice = true,
  showQR = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

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

  const handleQRScan = async () => {
    try {
      const code = await MobileUtils.scanQRCode();
      if (code && onQRScanned) {
        onQRScanned(code);
        toast({
          title: "QR Code Scanned",
          description: `Scanned: ${code}`,
        });
      }
    } catch (error) {
      toast({
        title: "QR Scan Error",
        description: "Failed to scan QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
      
      {showQR && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleQRScan}
          className="flex-1"
        >
          <QrCode className="h-4 w-4 mr-1" />
          Scan QR
        </Button>
      )}
    </div>
  );
};
