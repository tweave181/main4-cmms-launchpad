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
import { Copy, Check, RefreshCw, AlertCircle, CheckCircle2, Loader2, Download, Package, Info } from 'lucide-react';
import { toast } from 'sonner';
import { downloadPrintServiceZip } from '@/utils/printServiceDownload';

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPrintServiceZip();
      toast.success('Downloaded label-print-service.zip', {
        description: 'Check your Downloads folder and extract the ZIP file.',
      });
    } catch (error) {
      toast.error('Failed to download', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

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

          {/* Download Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Step 0: Download Print Service Files
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    These files are in the cloud and need to be downloaded to your Mac first.
                  </p>
                </div>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download label-print-service.zip
                    </>
                  )}
                </Button>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  <p className="font-medium">After downloading:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-0.5 text-blue-700/80 dark:text-blue-300/80">
                    <li>Find the ZIP in your Downloads folder</li>
                    <li>Double-click to extract it</li>
                    <li>You'll have a <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">label-print-service</code> folder</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

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

                <div className="border-l-2 border-red-500 pl-3 mt-3">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">⚠️ Important: "Next steps" after installation</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    After Homebrew installs, it shows "Next steps" that you <strong>must</strong> complete. 
                    On Apple Silicon Macs (M1/M2/M3), Homebrew installs to <code className="bg-muted px-1 rounded">/opt/homebrew</code> 
                    which isn't in your PATH by default.
                  </p>
                  <p className="text-xs font-medium mb-1">Run these commands shown in the "Next steps":</p>
                  <CodeBlock 
                    code={`echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"`} 
                    multiline 
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This adds Homebrew to your PATH so Terminal can find the <code className="bg-muted px-1 rounded">brew</code> command.
                  </p>
                </div>

                <div className="border-l-2 border-blue-500 pl-3 mt-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">If you get "brew: command not found" after installing:</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    This means the PATH wasn't configured. Run the commands above, then verify:
                  </p>
                  <CodeBlock code="brew --version" />
                  <p className="text-xs text-muted-foreground mt-2">
                    If it still doesn't work, close Terminal completely and open a new window.
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
                  Open the <strong>Terminal</strong> app (press ⌘+Space, type "Terminal") and navigate to the downloaded folder:
                </p>
                
                <div className="border-l-2 border-green-500 pl-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">📂 Navigate to the downloaded folder:</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    If you extracted the ZIP to your Downloads folder:
                  </p>
                  <CodeBlock code="cd ~/Downloads/label-print-service" />
                </div>

                <div className="bg-muted/50 rounded-md p-3 mt-2">
                  <p className="text-xs font-medium mb-1">✓ Verify you're in the right folder:</p>
                  <CodeBlock code="ls -la" />
                  <p className="text-xs text-muted-foreground mt-2">
                    You should see: <code className="bg-muted px-1 rounded">main.py</code>, <code className="bg-muted px-1 rounded">requirements.txt</code>, and <code className="bg-muted px-1 rounded">README.md</code>
                  </p>
                </div>

                <div className="border-l-2 border-amber-500 pl-3 mt-3">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">If you extracted elsewhere:</p>
                  <p className="text-xs text-muted-foreground">
                    Replace <code className="bg-muted px-1 rounded">~/Downloads</code> with where you extracted the ZIP 
                    (e.g., <code className="bg-muted px-1 rounded">cd ~/Desktop/label-print-service</code>)
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

            {/* Step 8: Run as Background Service */}
            <AccordionItem value="step-8">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">8</span>
                  Run as Background Service (Optional)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Instead of keeping Terminal open, you can run the service in the background.
                  </p>
                </div>

                {/* Option A: Quick Background */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Option A</span>
                    Quick Background (One-time)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Run in background until you restart your Mac:
                  </p>
                  <CodeBlock code="cd ~/Downloads/label-print-service && source venv/bin/activate && nohup uvicorn main:app --host 127.0.0.1 --port 8013 > print-service.log 2>&1 &" />
                  
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Useful commands:</p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex gap-2 items-center">
                        <code className="bg-muted px-2 py-1 rounded text-xs">lsof -i :8013</code>
                        <span className="text-muted-foreground text-xs">Check if running</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap">tail -f ~/Downloads/label-print-service/print-service.log</code>
                        <span className="text-muted-foreground text-xs">View logs</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <code className="bg-muted px-2 py-1 rounded text-xs">pkill -f "uvicorn main:app"</code>
                        <span className="text-muted-foreground text-xs">Stop service</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option B: Auto-Start on Login */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">Option B</span>
                    Auto-Start on Login (Recommended)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Service starts automatically when you log in to your Mac.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-2">Step 1: Create the service configuration</p>
                      <CodeBlock code={`cat > ~/Library/LaunchAgents/com.labelprint.service.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.labelprint.service</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ~/Downloads/label-print-service && source venv/bin/activate && uvicorn main:app --host 127.0.0.1 --port 8013</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/label-print-service.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/label-print-service-error.log</string>
</dict>
</plist>
EOF`} />
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium mb-2">Step 2: Enable the service</p>
                      <CodeBlock code="launchctl load ~/Library/LaunchAgents/com.labelprint.service.plist" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Management commands:</p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex gap-2 items-center">
                        <code className="bg-muted px-2 py-1 rounded text-xs">launchctl list | grep labelprint</code>
                        <span className="text-muted-foreground text-xs">Check status</span>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <code className="bg-muted px-2 py-1 rounded text-xs">launchctl unload ~/Library/LaunchAgents/com.labelprint.service.plist</code>
                        <span className="text-muted-foreground text-xs">Stop & disable</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    After setting up, click the <strong>Test</strong> button above to verify the service is running.
                  </p>
                </div>

                {/* Background Service Troubleshooting */}
                <div className="border-t pt-4 mt-4 space-y-4">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Background Service Troubleshooting
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">"Operation not permitted" error (launchd)</p>
                    <p className="text-xs text-muted-foreground">
                      macOS may block the service. Grant Terminal full disk access:
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                      <li>Open <strong>System Settings → Privacy & Security → Full Disk Access</strong></li>
                      <li>Add Terminal (or iTerm) to the list</li>
                      <li>Reload the service: <code className="bg-muted px-1 rounded">launchctl unload ... && launchctl load ...</code></li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Service not starting automatically</p>
                    <p className="text-xs text-muted-foreground">
                      Check if the plist file exists and is valid:
                    </p>
                    <CodeBlock code="cat ~/Library/LaunchAgents/com.labelprint.service.plist" />
                    <p className="text-xs text-muted-foreground mt-1">
                      If file not found, re-run Step 1. If file exists but service doesn't start, check logs below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">How to check background service logs</p>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">For nohup:</p>
                      <CodeBlock code="tail -f ~/Downloads/label-print-service/print-service.log" />
                      <p className="text-xs text-muted-foreground font-medium mt-2">For launchd:</p>
                      <CodeBlock code="tail -f /tmp/label-print-service.log /tmp/label-print-service-error.log" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Service starts but immediately stops</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                      <li>Check the error log: <code className="bg-muted px-1 rounded">cat /tmp/label-print-service-error.log</code></li>
                      <li>Verify Python path is correct in the plist</li>
                      <li>Ensure the virtual environment exists at the specified path</li>
                      <li>Try running manually first to confirm it works</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Multiple instances running</p>
                    <p className="text-xs text-muted-foreground">
                      Kill all instances and restart cleanly:
                    </p>
                    <CodeBlock code={`pkill -f "uvicorn main:app"
launchctl unload ~/Library/LaunchAgents/com.labelprint.service.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.labelprint.service.plist`} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Remove background service completely</p>
                    <p className="text-xs text-muted-foreground">
                      To stop and remove the auto-start service:
                    </p>
                    <CodeBlock code={`launchctl unload ~/Library/LaunchAgents/com.labelprint.service.plist
rm ~/Library/LaunchAgents/com.labelprint.service.plist`} />
                  </div>
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
