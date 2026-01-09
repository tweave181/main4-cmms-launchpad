import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrintServiceSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

const PRINT_SERVICE_URL = 'http://localhost:8013';

const CodeBlock = ({ code, multiline = false }: { code: string; multiline?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-2 bg-gray-900 rounded-md p-3 ${multiline ? 'flex-col' : ''}`}>
      <code className={`text-green-400 text-sm flex-1 font-mono ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {code}
      </code>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 shrink-0"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export const PrintServiceSetupModal: React.FC<PrintServiceSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [printerInfo, setPrinterInfo] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/health`, {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setPrinterInfo(data.printer || null);
      } else {
        setStatus('disconnected');
        setPrinterInfo(null);
      }
    } catch {
      setStatus('disconnected');
      setPrinterInfo(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen, checkConnection]);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Running
          </Badge>
        );
      case 'checking':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🖨️ QL-570 Print Service Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Section */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Service Status:</span>
              {getStatusBadge()}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={checkConnection}
              disabled={status === 'checking'}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
              Test
            </Button>
          </div>

          {printerInfo && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Printer:</strong> {printerInfo}
              </p>
            </div>
          )}

          {/* Setup Steps */}
          <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
            <AccordionItem value="step-1">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Install Prerequisites (macOS)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Install libusb for USB printer access:</p>
                <CodeBlock code="brew install libusb" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-2">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Navigate to Service Directory
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Open Terminal and navigate to the print service folder:</p>
                <CodeBlock code="cd label-print-service" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Create Virtual Environment
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Create and activate a Python virtual environment:</p>
                <CodeBlock code="python3 -m venv venv" />
                <CodeBlock code="source venv/bin/activate" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-4">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                  Install Dependencies
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Install required Python packages:</p>
                <CodeBlock code="pip install -r requirements.txt" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-5">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
                  Start the Service
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Run the print service:</p>
                <CodeBlock code="uvicorn main:app --host 127.0.0.1 --port 8013" />
                <p className="text-xs text-muted-foreground mt-2">
                  Keep this terminal window open while printing. Press Ctrl+C to stop.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Troubleshooting
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">"Device not found" error</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Check the printer is connected via USB and powered on</li>
                    <li>Try a different USB port or cable</li>
                    <li>Restart the printer</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">"Permission denied" error</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Reinstall libusb: <code className="bg-muted px-1 rounded">brew reinstall libusb</code></li>
                    <li>Disconnect and reconnect the printer</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Find your printer's USB ID</p>
                  <CodeBlock code="brother_ql discover" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Check supported label sizes</p>
                  <CodeBlock code="brother_ql info labels" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {status === 'connected' && (
            <Button onClick={onClose}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Ready to Print
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
