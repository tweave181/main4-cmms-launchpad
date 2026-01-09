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
                  Check & Install Homebrew
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Homebrew is a package manager for macOS. First, check if it's installed:
                </p>
                <CodeBlock code="brew --version" />
                <p className="text-xs text-muted-foreground">
                  If you see a version number (e.g., "Homebrew 4.x.x"), skip to Step 2.
                </p>
                <div className="border-l-2 border-amber-500 pl-3 mt-2">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">If Homebrew is not installed:</p>
                  <p className="text-xs text-muted-foreground mb-2">Run this command to install it:</p>
                  <CodeBlock code='/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' />
                  <p className="text-xs text-muted-foreground mt-2">
                    Follow the on-screen prompts. You may need to enter your Mac password.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-2">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Install libusb
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>libusb</strong> allows Python to communicate directly with USB devices like the Brother QL-570, 
                  bypassing the standard macOS print system.
                </p>
                <CodeBlock code="brew install libusb" />
                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Verify installation:</p>
                  <CodeBlock code="brew list libusb" />
                  <p className="text-xs text-muted-foreground mt-2">
                    You should see a list of installed files. If you get "Error: No such keg", libusb didn't install correctly.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Navigate to Service Directory
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Open the <strong>Terminal</strong> app (press ⌘+Space, type "Terminal") and navigate to where you saved the print service:
                </p>
                <CodeBlock code="cd ~/label-print-service" />
                <p className="text-xs text-muted-foreground">
                  Adjust the path if you saved it elsewhere. Use <code className="bg-muted px-1 rounded">ls</code> to list files and verify you're in the right folder.
                </p>
                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Verify you're in the right folder:</p>
                  <CodeBlock code="ls -la" />
                  <p className="text-xs text-muted-foreground mt-2">
                    You should see files like <code className="bg-muted px-1 rounded">main.py</code> and <code className="bg-muted px-1 rounded">requirements.txt</code>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-4">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                  Create Virtual Environment
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  A virtual environment keeps the print service dependencies separate from your system Python. 
                  This prevents conflicts with other Python projects.
                </p>
                <p className="text-xs font-medium">Create the environment:</p>
                <CodeBlock code="python3 -m venv venv" />
                <p className="text-xs font-medium mt-3">Activate it:</p>
                <CodeBlock code="source venv/bin/activate" />
                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Verify activation:</p>
                  <p className="text-xs text-muted-foreground">
                    Your terminal prompt should now start with <code className="bg-muted px-1 rounded">(venv)</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can also run: <code className="bg-muted px-1 rounded">which python</code> — it should show a path ending in <code className="bg-muted px-1 rounded">venv/bin/python</code>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-5">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
                  Install Dependencies
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Install the required Python packages (FastAPI, brother_ql, Pillow, etc.):
                </p>
                <CodeBlock code="pip install -r requirements.txt" />
                <p className="text-xs text-muted-foreground">
                  This may take a minute. You'll see packages being downloaded and installed.
                </p>
                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Verify brother_ql installed:</p>
                  <CodeBlock code="brother_ql --version" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-6">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">6</span>
                  Connect & Detect Printer
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Brother QL-570 via USB and power it on. Then discover available printers:
                </p>
                <CodeBlock code="brother_ql discover" />
                <p className="text-xs text-muted-foreground">
                  You should see output like: <code className="bg-muted px-1 rounded">usb://0x04f9:0x2028</code>
                </p>
                <div className="border-l-2 border-blue-500 pl-3 mt-2">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">If no printer is found:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 mt-1">
                    <li>Check the USB cable is securely connected</li>
                    <li>Make sure the printer is powered on (green light)</li>
                    <li>Try a different USB port</li>
                    <li>Restart the printer</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-7">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">7</span>
                  Start the Service
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Run the print service. It will start a local web server on port 8013:
                </p>
                <CodeBlock code="uvicorn main:app --host 127.0.0.1 --port 8013" />
                <p className="text-xs text-muted-foreground">
                  You should see output like: <code className="bg-muted px-1 rounded">Uvicorn running on http://127.0.0.1:8013</code>
                </p>
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">✓ Keep this terminal open!</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    The service runs while the terminal is open. Press <kbd className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">Ctrl+C</kbd> to stop it when done.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Test the service:</p>
                  <p className="text-xs text-muted-foreground mb-2">Open a new terminal and run:</p>
                  <CodeBlock code="curl http://localhost:8013/health" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Or click the <strong>Test</strong> button above to verify the connection.
                  </p>
                </div>
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
                  <p className="text-sm font-medium">"No backend available" error</p>
                  <p className="text-xs text-muted-foreground">
                    This means libusb isn't installed or not found. Try:
                  </p>
                  <CodeBlock code="brew reinstall libusb" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">"Permission denied" error</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Reinstall libusb: <code className="bg-muted px-1 rounded">brew reinstall libusb</code></li>
                    <li>Disconnect and reconnect the printer</li>
                    <li>Try running with sudo (not recommended for regular use)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">"Device not found" error</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Check the printer is connected via USB and powered on</li>
                    <li>Try a different USB port or cable</li>
                    <li>Restart the printer</li>
                    <li>Check System Information → USB to verify macOS sees the device</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">"Address already in use" error</p>
                  <p className="text-xs text-muted-foreground">
                    Another service is using port 8013. Find and stop it:
                  </p>
                  <CodeBlock code="lsof -i :8013" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Then kill the process: <code className="bg-muted px-1 rounded">kill -9 PID</code> (replace PID with the number shown)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Check supported label sizes</p>
                  <CodeBlock code="brother_ql info labels" />
                  <p className="text-xs text-muted-foreground">
                    The QL-570 supports: 17x54, 17x87, 23x23, 29x42, 29x90, 38x90, 39x48, 52x29, 62x29, 62x100, 12mm, 29mm, 38mm, 50mm, 54mm, 62mm
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick start command (after first setup)</p>
                  <p className="text-xs text-muted-foreground">
                    Once set up, you only need these commands to start the service:
                  </p>
                  <CodeBlock code="cd ~/label-print-service && source venv/bin/activate && uvicorn main:app --host 127.0.0.1 --port 8013" />
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
