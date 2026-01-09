# Label Print Service for Brother QL-570

A local HTTP service that prints labels directly to a Brother QL-570 via USB, bypassing macOS driver requirements.

## Architecture

```
┌─────────────────────┐     HTTP POST      ┌──────────────────────┐     USB      ┌─────────────┐
│   Lovable App       │ ──────────────────►│  Label Print Service │ ────────────►│  QL-570     │
│   (Browser)         │   localhost:8013   │  (FastAPI + Python)  │   pyusb      │  (Printer)  │
└─────────────────────┘                    └──────────────────────┘              └─────────────┘
```

## Prerequisites

- macOS Tahoe (or any macOS/Linux)
- Python 3.9+
- Homebrew (for libusb on macOS)
- Brother QL-570 connected via USB

## Installation

### 1. Install libusb (required for USB communication)

```bash
brew install libusb
```

### 2. Create project directory and virtual environment

```bash
# Navigate to the label-print-service directory
cd label-print-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

## Running the Service

### Basic usage (no authentication)

```bash
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8013
```

### With token authentication

```bash
source venv/bin/activate
PRINT_TOKEN=your-secret-token uvicorn main:app --host 127.0.0.1 --port 8013
```

### Run directly with Python

```bash
source venv/bin/activate
python main.py
```

## API Endpoints

### Health Check

```bash
# GET or POST
curl http://localhost:8013/health
```

Response:
```json
{
  "ok": true,
  "printer": "QL-570",
  "supported_labels": ["62x100", "62", "29x90", "17x54", "29", "38"]
}
```

### Print Label

```bash
# Simple print
curl -X POST http://localhost:8013/print \
  -H "Content-Type: application/json" \
  -d '{"text": "E15/001\nBMS Panel"}'

# With options
curl -X POST http://localhost:8013/print \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Asset Tag: E15/001\nLocation: Building A\nType: BMS Panel",
    "label": "62x100",
    "copies": 2,
    "rotate": 0
  }'

# With token authentication
curl -X POST http://localhost:8013/print \
  -H "Content-Type: application/json" \
  -H "X-Print-Token: your-secret-token" \
  -d '{"text": "E15/001"}'
```

### Print Request Body

| Field   | Type   | Default  | Description                                    |
|---------|--------|----------|------------------------------------------------|
| text    | string | required | Text to print (use \n for multiline)           |
| label   | string | "62x100" | Label size (62x100, 62, 29x90, 17x54, 29, 38) |
| copies  | int    | 1        | Number of copies (1-100)                       |
| rotate  | int    | 0        | Rotation in degrees (0, 90, 180, 270)          |
| dpi     | int    | 300      | Print resolution                               |

### Supported Label Sizes

| Label    | Dimensions   | Brother Part | Description           |
|----------|--------------|--------------|----------------------|
| 62x100   | 62mm × 100mm | DK-11202     | Shipping label       |
| 62       | 62mm square  | DK-22205     | Continuous (square)  |
| 29x90    | 29mm × 90mm  | DK-11201     | Address label        |
| 17x54    | 17mm × 54mm  | DK-11204     | Multi-purpose        |
| 29       | 29mm         | DK-22210     | Continuous           |
| 38       | 38mm         | DK-22225     | Continuous           |

## Troubleshooting

### USB Permission Issues

If you get permission errors:

```bash
# Verify libusb is installed
brew list libusb

# Reinstall if needed
brew reinstall libusb

# Check if printer is detected
system_profiler SPUSBDataType | grep -A 10 "QL-570"
```

### Find Printer USB ID

```bash
# Activate venv first
source venv/bin/activate

# Discover connected Brother printers
brother_ql discover
# Expected output: usb://0x04f9:0x2028

# If different, update PRINTER_ID in main.py
```

### List Supported Labels

```bash
source venv/bin/activate
brother_ql info labels
```

### Common Errors

| Error | Solution |
|-------|----------|
| "Device not found" | Ensure printer is connected and powered on |
| "No backend available" | Install libusb: `brew install libusb` |
| "Permission denied" | Check USB permissions, may need to run with `sudo` |
| "Label not found" | Use a supported label size (see table above) |

### Verify Printer Connection

```bash
# List USB devices
system_profiler SPUSBDataType | grep -i brother

# Check brother_ql can see the printer
source venv/bin/activate
brother_ql --printer usb://0x04f9:0x2028 --model QL-570 status
```

## Integration with Lovable

The Lovable app calls this service via HTTP. Example integration:

```typescript
const PRINT_SERVICE_URL = 'http://localhost:8013';

async function printLabel(text: string, copies: number = 1) {
  const response = await fetch(`${PRINT_SERVICE_URL}/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      label: '62x100',
      copies,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Print failed');
  }
  
  return response.json();
}
```

## Running as a Background Service (Optional)

To run the service automatically on startup:

### Using launchd (macOS)

Create `~/Library/LaunchAgents/com.labelprint.service.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.labelprint.service</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/label-print-service/venv/bin/uvicorn</string>
        <string>main:app</string>
        <string>--host</string>
        <string>127.0.0.1</string>
        <string>--port</string>
        <string>8013</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/label-print-service</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load the service:

```bash
launchctl load ~/Library/LaunchAgents/com.labelprint.service.plist
```

## Security Notes

- The service binds to `127.0.0.1` only (localhost) - not accessible from other machines
- Optional token authentication via `PRINT_TOKEN` environment variable
- CORS is configured for local development ports only
