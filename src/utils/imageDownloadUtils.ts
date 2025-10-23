import JSZip from 'jszip';
import { ChecklistItemTemplate } from '@/types/checklistTemplate';
import { format } from 'date-fns';

/**
 * Downloads a single image with a custom name
 */
export async function downloadSingleImage(imageUrl: string, imageName: string): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Extract file extension from URL or default to 'png'
    const urlExtension = imageUrl.split('.').pop()?.split('?')[0] || 'png';
    const extension = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(urlExtension.toLowerCase()) 
      ? urlExtension 
      : 'png';
    
    // Clean the image name and add extension
    const cleanName = imageName.replace(/[/\\:*?"<>|]/g, '_');
    const fileName = `${cleanName}.${extension}`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image');
  }
}

/**
 * Downloads multiple images as a ZIP file
 */
export async function downloadMultipleImagesAsZip(
  images: Array<{ url: string; name: string }>
): Promise<void> {
  try {
    const zip = new JSZip();
    const nameCounter: Record<string, number> = {};
    
    // Fetch all images and add to ZIP
    await Promise.all(
      images.map(async (img) => {
        try {
          const response = await fetch(img.url);
          const blob = await response.blob();
          
          // Extract extension
          const urlExtension = img.url.split('.').pop()?.split('?')[0] || 'png';
          const extension = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(urlExtension.toLowerCase()) 
            ? urlExtension 
            : 'png';
          
          // Clean name and handle duplicates
          let cleanName = img.name.replace(/[/\\:*?"<>|]/g, '_');
          let fileName = `${cleanName}.${extension}`;
          
          // Handle duplicate names
          if (nameCounter[fileName]) {
            nameCounter[fileName]++;
            fileName = `${cleanName} (${nameCounter[fileName]}).${extension}`;
          } else {
            nameCounter[fileName] = 1;
          }
          
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Failed to fetch image: ${img.name}`, error);
        }
      })
    );
    
    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist-images-${format(new Date(), 'yyyy-MM-dd')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new Error('Failed to create ZIP file');
  }
}

/**
 * Exports a CSV list of images with metadata
 */
export function exportImageListAsCSV(templates: ChecklistItemTemplate[]): void {
  try {
    // Filter templates that have images
    const templatesWithImages = templates.filter(t => t.image_url);
    
    if (templatesWithImages.length === 0) {
      throw new Error('No images to export');
    }
    
    // CSV headers
    const headers = [
      'Image Name',
      'Item Text',
      'Description',
      'Type',
      'Safety Critical',
      'Image URL',
      'Upload Date'
    ];
    
    // CSV rows
    const rows = templatesWithImages.map(template => {
      return [
        template.image_name || template.item_text,
        template.item_text,
        template.description || '',
        template.item_type,
        template.safety_critical ? 'Yes' : 'No',
        template.image_url || '',
        format(new Date(template.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = String(cell).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      });
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist-images-list-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV');
  }
}
