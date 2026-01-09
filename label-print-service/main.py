"""
Label Print Service for Brother QL-570
A local HTTP service that prints labels directly to a Brother QL-570 via USB.
"""

import os
import io
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="Label Print Service", version="1.0.0")

# Allow CORS from localhost for browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PRINT_TOKEN = os.environ.get("PRINT_TOKEN")
MODEL = "QL-570"
BACKEND = "pyusb"
PRINTER_ID = "usb://0x04f9:0x2028"  # Brother QL-570 USB Vendor:Product ID

# Label dimensions in pixels at 300 DPI
# Formula: mm * 300 / 25.4 = pixels
LABEL_SIZES = {
    "62x100": (696, 1109),   # 62mm x 100mm die-cut (DK-11202)
    "62": (696, 696),        # 62mm continuous square (DK-22205)
    "29x90": (306, 991),     # 29mm x 90mm address (DK-11201)
    "17x54": (165, 566),     # 17mm x 54mm multi-purpose (DK-11204)
    "29": (306, 306),        # 29mm continuous
    "38": (413, 413),        # 38mm continuous
}

# Map our label names to brother_ql label identifiers
BROTHER_QL_LABELS = {
    "62x100": "62x100",
    "62": "62",
    "29x90": "29x90",
    "17x54": "17x54",
    "29": "29",
    "38": "38",
}


class PrintRequest(BaseModel):
    text: str = Field(..., description="Text to print on the label (supports multiline with \\n)")
    label: str = Field(default="62x100", description="Label size (e.g., 62x100, 62, 29x90, 17x54)")
    copies: int = Field(default=1, ge=1, le=100, description="Number of copies to print")
    rotate: int = Field(default=0, description="Rotation in degrees (0, 90, 180, 270)")
    dpi: int = Field(default=300, description="Print resolution (300 recommended)")


class HealthResponse(BaseModel):
    ok: bool = True
    printer: str = MODEL
    supported_labels: list[str] = list(LABEL_SIZES.keys())


class PrintResponse(BaseModel):
    success: bool
    message: str
    copies_printed: int


def verify_token(x_print_token: Optional[str] = Header(None)):
    """Verify the print token if PRINT_TOKEN is set."""
    if PRINT_TOKEN:
        if not x_print_token or x_print_token != PRINT_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid or missing X-Print-Token")
    return True


def create_label_image(text: str, label_size: str, rotate: int = 0) -> Image.Image:
    """Create a label image with centered text."""
    if label_size not in LABEL_SIZES:
        raise ValueError(f"Unsupported label size: {label_size}. Supported: {list(LABEL_SIZES.keys())}")
    
    width, height = LABEL_SIZES[label_size]
    
    # Create white background
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    
    # Split text into lines
    lines = text.split("\n")
    
    # Try to find a good font size
    # Start with a large size and reduce until text fits
    max_font_size = min(width, height) // 3
    font_size = max_font_size
    
    # Try to use a monospace font, fall back to default
    font = None
    font_paths = [
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Monaco.ttf",
        "/System/Library/Fonts/Courier.dfont",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    ]
    
    for font_path in font_paths:
        try:
            font = ImageFont.truetype(font_path, font_size)
            break
        except (IOError, OSError):
            continue
    
    if font is None:
        font = ImageFont.load_default()
    
    # Calculate text dimensions and adjust font size if needed
    margin = int(width * 0.05)  # 5% margin
    max_width = width - (margin * 2)
    max_height = height - (margin * 2)
    
    # Find optimal font size
    while font_size > 12:
        try:
            font = ImageFont.truetype(font_paths[0] if font_paths else "", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()
            break
        
        # Calculate total text height and max line width
        total_height = 0
        max_line_width = 0
        line_height = font_size + 4
        
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_width = bbox[2] - bbox[0]
            max_line_width = max(max_line_width, line_width)
            total_height += line_height
        
        if max_line_width <= max_width and total_height <= max_height:
            break
        
        font_size -= 2
    
    # Calculate starting Y position to center vertically
    line_height = font_size + 4
    total_text_height = len(lines) * line_height
    start_y = (height - total_text_height) // 2
    
    # Draw each line centered
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        line_width = bbox[2] - bbox[0]
        x = (width - line_width) // 2
        y = start_y + (i * line_height)
        draw.text((x, y), line, fill="black", font=font)
    
    # Apply rotation if specified
    if rotate in [90, 180, 270]:
        img = img.rotate(rotate, expand=True)
    
    return img


def print_label(image: Image.Image, label_size: str, copies: int = 1) -> dict:
    """Print the label image to the Brother QL-570."""
    try:
        from brother_ql.conversion import convert
        from brother_ql.backends.helpers import send
        from brother_ql.raster import BrotherQLRaster
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="brother_ql library not installed. Run: pip install brother-ql"
        )
    
    # Get the brother_ql label identifier
    ql_label = BROTHER_QL_LABELS.get(label_size, "62x100")
    
    # Create raster data
    qlr = BrotherQLRaster(MODEL)
    
    # Convert image to brother_ql format
    instructions = convert(
        qlr=qlr,
        images=[image],
        label=ql_label,
        rotate="auto",
        threshold=70.0,
        dither=False,
        compress=False,
        red=False,
        dpi_600=False,
        hq=True,
        cut=True,
    )
    
    # Print the specified number of copies
    for _ in range(copies):
        try:
            send(
                instructions=instructions,
                printer_identifier=PRINTER_ID,
                backend_identifier=BACKEND,
                blocking=True,
            )
        except Exception as e:
            error_msg = str(e)
            if "usb.core.NoBackendError" in error_msg:
                raise HTTPException(
                    status_code=500,
                    detail="USB backend not available. Install libusb: brew install libusb"
                )
            elif "Device not found" in error_msg or "No device" in error_msg:
                raise HTTPException(
                    status_code=500,
                    detail="Printer not found. Ensure QL-570 is connected via USB and powered on."
                )
            else:
                raise HTTPException(status_code=500, detail=f"Print error: {error_msg}")
    
    return {"success": True, "copies_printed": copies}


@app.post("/health", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()


@app.post("/print", response_model=PrintResponse, dependencies=[Depends(verify_token)])
async def print_label_endpoint(request: PrintRequest):
    """Print a label with the specified text."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if request.label not in LABEL_SIZES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported label size: {request.label}. Supported: {list(LABEL_SIZES.keys())}"
        )
    
    if request.rotate not in [0, 90, 180, 270]:
        raise HTTPException(status_code=400, detail="Rotation must be 0, 90, 180, or 270")
    
    # Create the label image
    try:
        image = create_label_image(request.text, request.label, request.rotate)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create label image: {str(e)}")
    
    # Print the label
    result = print_label(image, request.label, request.copies)
    
    return PrintResponse(
        success=True,
        message=f"Successfully printed {result['copies_printed']} label(s)",
        copies_printed=result["copies_printed"]
    )


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "service": "Label Print Service",
        "version": "1.0.0",
        "printer": MODEL,
        "endpoints": {
            "/health": "GET/POST - Health check",
            "/print": "POST - Print a label",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8013)
