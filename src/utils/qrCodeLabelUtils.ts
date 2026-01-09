import { jsPDF } from 'jspdf';

interface AssetLabelData {
  assetTag: string;
  assetName: string;
}

type LabelSize = 'small' | 'medium' | 'large';

interface LabelConfig {
  width: number;
  height: number;
  qrSize: number;
  fontSize: number;
  nameFontSize: number;
}

const LABEL_CONFIGS: Record<LabelSize, LabelConfig> = {
  small: { width: 50, height: 30, qrSize: 20, fontSize: 8, nameFontSize: 6 },
  medium: { width: 70, height: 40, qrSize: 28, fontSize: 10, nameFontSize: 8 },
  large: { width: 100, height: 60, qrSize: 40, fontSize: 14, nameFontSize: 10 },
};

export const generateAssetQRLabelPDF = async (
  asset: AssetLabelData,
  qrCodeDataUrl: string,
  size: LabelSize = 'medium',
  includeAssetName: boolean = true,
  copies: number = 1
): Promise<jsPDF> => {
  const config = LABEL_CONFIGS[size];
  const doc = new jsPDF({
    orientation: config.width > config.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [config.width, config.height],
  });

  for (let i = 0; i < copies; i++) {
    if (i > 0) {
      doc.addPage([config.width, config.height]);
    }

    const centerX = config.width / 2;
    const qrX = centerX - config.qrSize / 2;
    const qrY = 3;

    // Add QR code image
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, config.qrSize, config.qrSize);

    // Add asset tag text
    doc.setFontSize(config.fontSize);
    doc.setFont('helvetica', 'bold');
    const tagY = qrY + config.qrSize + 4;
    doc.text(asset.assetTag, centerX, tagY, { align: 'center' });

    // Add asset name if enabled
    if (includeAssetName && asset.assetName) {
      doc.setFontSize(config.nameFontSize);
      doc.setFont('helvetica', 'normal');
      const nameY = tagY + 4;
      const maxWidth = config.width - 6;
      const truncatedName = truncateText(asset.assetName, maxWidth, config.nameFontSize);
      doc.text(truncatedName, centerX, nameY, { align: 'center' });
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
