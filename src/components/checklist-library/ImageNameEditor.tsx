import React, { useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateImageName } from '@/hooks/useChecklistTemplates';
import { toast } from 'sonner';

interface ImageNameEditorProps {
  templateId: string;
  currentName: string;
  onSuccess?: () => void;
}

export const ImageNameEditor: React.FC<ImageNameEditorProps> = ({
  templateId,
  currentName,
  onSuccess
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentName);
  const updateImageName = useUpdateImageName();

  const handleSave = async () => {
    if (!editValue.trim()) {
      toast.error('Image name cannot be empty');
      return;
    }

    // Validate no invalid characters
    if (/[/\\:*?"<>|]/.test(editValue)) {
      toast.error('Image name contains invalid characters: / \\ : * ? " < > |');
      return;
    }

    if (editValue.length > 100) {
      toast.error('Image name must be 100 characters or less');
      return;
    }

    try {
      await updateImageName.mutateAsync({
        id: templateId,
        image_name: editValue.trim()
      });
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update image name:', error);
    }
  };

  const handleCancel = () => {
    setEditValue(currentName);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group">
        <span className="text-sm">{currentName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
        className="h-8 text-sm"
        autoFocus
        maxLength={100}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleSave}
        disabled={updateImageName.isPending}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleCancel}
        disabled={updateImageName.isPending}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
