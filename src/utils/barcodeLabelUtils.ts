import { jsPDF } from 'jspdf';

interface AssetLabelData {
  assetTag: string;
  assetName: string;
}

// 50mm x 25mm Zebra label configuration
const LABEL_CONFIG = {
  width: 50,
  height: 25,
  barcodeWidth: 45,
  barcodeHeight: 10,
  fontSize: 9,
  nameFontSize: 6,
};

export const generateAssetBarcodeLabelPDF = async (
  asset: AssetLabelData,
  barcodeDataUrl: string,
  includeAssetName: boolean = true,
  copies: number = 1
): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [LABEL_CONFIG.width, LABEL_CONFIG.height],
  });

  for (let i = 0; i < copies; i++) {
    if (i > 0) {
      doc.addPage([LABEL_CONFIG.width, LABEL_CONFIG.height]);
    }

    const centerX = LABEL_CONFIG.width / 2;
    
    // Asset tag at top, centered
    doc.setFontSize(LABEL_CONFIG.fontSize);
    doc.setFont('courier', 'bold');
    doc.text(asset.assetTag, centerX, 5, { align: 'center' });

    // Barcode in center
    const barcodeX = (LABEL_CONFIG.width - LABEL_CONFIG.barcodeWidth) / 2;
    const barcodeY = 7;
    doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, LABEL_CONFIG.barcodeWidth, LABEL_CONFIG.barcodeHeight);

    // Asset name at bottom if included
    if (includeAssetName && asset.assetName) {
      doc.setFontSize(LABEL_CONFIG.nameFontSize);
      doc.setFont('helvetica', 'normal');
      const maxWidth = LABEL_CONFIG.width - 4;
      const truncatedName = truncateText(asset.assetName, maxWidth, LABEL_CONFIG.nameFontSize);
      doc.text(truncatedName, centerX, 21, { align: 'center' });
    }
  }

  return doc;
};

const truncateText = (text: string, maxWidth: number, fontSize: number): string => {
  // Approximate character width based on font size
  const charWidth = fontSize * 0.5;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  if (text.length <= maxChars) {
    return text;
  }
  
  return text.substring(0, maxChars - 3) + '...';
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

export const printPDF = (doc: jsPDF): void => {
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Remove any existing print iframe
  const existingFrame = document.getElementById('barcode-label-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }
  
  // Create hidden iframe for printing (avoids popup blocker)
  const iframe = document.createElement('iframe');
  iframe.id = 'barcode-label-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);
  };
  
  // Cleanup after 60 seconds
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
    iframe.remove();
  }, 60000);
  
  iframe.src = pdfUrl;
  document.body.appendChild(iframe);
};
