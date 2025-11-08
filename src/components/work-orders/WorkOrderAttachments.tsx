import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Paperclip, Download, Trash2, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import {
  useWorkOrderAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useDownloadAttachment,
  useGetImageUrl,
} from '@/hooks/useWorkOrderAttachments';
import { useAuth } from '@/contexts/auth';
import { ImagePreviewModal } from './ImagePreviewModal';
import { formatDistanceToNow } from 'date-fns';

interface WorkOrderAttachmentsProps {
  workOrderId: string;
}

export const WorkOrderAttachments: React.FC<WorkOrderAttachmentsProps> = ({
  workOrderId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useAuth();
  const { data: attachments = [], isLoading } = useWorkOrderAttachments(workOrderId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const downloadMutation = useDownloadAttachment();
  const getImageUrlMutation = useGetImageUrl();

  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
    filePath: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndUploadFiles = async (files: FileList | File[]) => {
    if (!userProfile?.tenant_id) return;

    const fileArray = Array.from(files);
    const allowedTypes = ['image/', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument', 'text/plain',
      'application/vnd.ms-excel'];

    for (const file of fileArray) {
      // Validate file type
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        alert(`File ${file.name} is not a supported file type.`);
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      await uploadMutation.mutateAsync({
        workOrderId,
        file,
        tenantId: userProfile.tenant_id,
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await validateAndUploadFiles(files);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone completely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await validateAndUploadFiles(files);
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    downloadMutation.mutate({ filePath, fileName });
  };

  const handlePreview = async (filePath: string, fileName: string) => {
    const url = await getImageUrlMutation.mutateAsync(filePath);
    setPreviewImage({ url, fileName, filePath });
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleDelete = (attachmentId: string, filePath: string) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteMutation.mutate({ attachmentId, filePath, workOrderId });
    }
  };

  const isImage = (fileType: string): boolean => {
    return fileType.startsWith('image/');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5 text-primary" />
            <span>Attachments</span>
            {attachments.length > 0 && (
              <Badge variant="secondary">{attachments.length}</Badge>
            )}
          </CardTitle>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={isDragging ? 'border-2 border-dashed border-primary bg-primary/5 rounded-lg transition-colors' : ''}
      >
        {isDragging && (
          <div className="border-2 border-dashed border-primary rounded-lg p-8 mb-4 bg-primary/5">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-3 text-primary animate-bounce" />
              <p className="text-sm font-medium text-primary">Drop files here to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports images, PDFs, documents (max 10MB each)
              </p>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading attachments...</div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No attachments yet</p>
            <p className="text-xs mt-1">Drag and drop files here or click Upload Files</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports images, PDFs, documents (max 10MB each)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-muted-foreground">
                    {getFileIcon(attachment.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.file_name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(attachment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {attachment.uploader && (
                        <>
                          <span>•</span>
                          <span>{attachment.uploader.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isImage(attachment.file_type) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handlePreview(attachment.file_path, attachment.file_name)
                      }
                      disabled={getImageUrlMutation.isPending}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(attachment.file_path, attachment.file_name)
                    }
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {userProfile?.id === attachment.uploaded_by && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDelete(attachment.id, attachment.file_path)
                      }
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {previewImage && (
          <ImagePreviewModal
            isOpen={!!previewImage}
            onClose={handleClosePreview}
            imageUrl={previewImage.url}
            fileName={previewImage.fileName}
            onDownload={() =>
              handleDownload(previewImage.filePath, previewImage.fileName)
            }
          />
        )}
      </CardContent>
    </Card>
  );
};
