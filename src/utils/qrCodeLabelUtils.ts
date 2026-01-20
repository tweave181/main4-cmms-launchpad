import { jsPDF } from 'jspdf';

interface AssetLabelData {
  assetTag: string;
  assetName: string;
}

// 50mm x 25mm Zebra label configuration
const LABEL_CONFIG = {
  width: 50,
  height: 25,
  qrSize: 18,
  fontSize: 7,
  nameFontSize: 5,
};

export const generateAssetQRLabelPDF = async (
  asset: AssetLabelData,
  qrCodeDataUrl: string,
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

    const qrX = 3;
    const qrY = (LABEL_CONFIG.height - LABEL_CONFIG.qrSize) / 2;

    // Add QR code image on the left
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, LABEL_CONFIG.qrSize, LABEL_CONFIG.qrSize);

    // Text starts after QR code
    const textX = qrX + LABEL_CONFIG.qrSize + 3;
    const centerY = LABEL_CONFIG.height / 2;

    // Add asset tag text
    doc.setFontSize(LABEL_CONFIG.fontSize);
    doc.setFont('helvetica', 'bold');
    
    if (includeAssetName && asset.assetName) {
      // Position tag and name vertically centered together
      doc.text(asset.assetTag, textX, centerY - 1);
      
      doc.setFontSize(LABEL_CONFIG.nameFontSize);
      doc.setFont('helvetica', 'normal');
      const maxWidth = LABEL_CONFIG.width - textX - 2;
      const truncatedName = truncateText(asset.assetName, maxWidth, LABEL_CONFIG.nameFontSize);
      doc.text(truncatedName, textX, centerY + 3);
    } else {
      // Just the tag, centered vertically
      doc.text(asset.assetTag, textX, centerY + 1);
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
  const existingFrame = document.getElementById('qr-label-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }
  
  // Create hidden iframe for printing (avoids popup blocker)
  const iframe = document.createElement('iframe');
  iframe.id = 'qr-label-print-frame';
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
