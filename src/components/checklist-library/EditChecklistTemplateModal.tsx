import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, AlertTriangle, Trash2 } from 'lucide-react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useUpdateChecklistTemplate, useDeleteChecklistTemplate, useChecklistTemplate } from '@/hooks/useChecklistTemplates';
import { useTemplateUsage } from '@/hooks/useChecklistTemplates';
import { getTypeIcon, getTypeLabel } from './ChecklistTypeIcons';
import type { ChecklistItemType } from '@/types/checklistTemplate';

const formSchema = z.object({
  item_text: z.string().min(1, 'Item text is required').max(200, 'Item text must be 200 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  item_type: z.enum(['safety_note', 'checkbox', 'to_do', 'reading'] as const),
  safety_critical: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EditChecklistTemplateModalProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditChecklistTemplateModal: React.FC<EditChecklistTemplateModalProps> = ({
  templateId,
  open,
  onOpenChange,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: template } = useChecklistTemplate(templateId);
  const { data: usage } = useTemplateUsage(templateId);
  const updateMutation = useUpdateChecklistTemplate();
  const deleteMutation = useDeleteChecklistTemplate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_text: '',
      description: '',
      item_type: 'checkbox',
      safety_critical: false,
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        item_text: template.item_text,
        description: template.description || '',
        item_type: template.item_type,
        safety_critical: template.safety_critical,
      });
      setImagePreview(template.image_url || null);
    }
  }, [template, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2097152) {
        form.setError('root', { message: 'Image must be less than 2MB' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (data: FormData) => {
    updateMutation.mutate(
      {
        id: templateId,
        data: { ...data, image_file: imageFile || undefined, image_url: imagePreview || undefined },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(templateId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const usageCount = usage?.length || 0;
  const isInUse = usageCount > 0;
  const isSafetyCritical = template?.safety_critical || false;
  const canDelete = !isSafetyCritical || !isInUse;

  const itemTypes: ChecklistItemType[] = ['safety_note', 'checkbox', 'to_do', 'reading'];

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <FormDialogHeader>
            <FormDialogTitle>Edit Checklist Item</FormDialogTitle>
          </FormDialogHeader>

          {isInUse && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This item is currently used in {usageCount} PM schedule{usageCount > 1 ? 's' : ''}. Changes will apply to all schedules.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="item_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Text *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Check for physical damage" />
                    </FormControl>
                    <FormDescription>Clear, concise description of the checklist item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional details or instructions..." rows={3} />
                    </FormControl>
                    <FormDescription>Provide more context or instructions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="item_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type *</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-4">
                        {itemTypes.map((type) => {
                          const Icon = getTypeIcon(type);
                          const label = getTypeLabel(type);
                          return (
                            <div key={type} className="flex items-center space-x-2">
                              <RadioGroupItem value={type} id={type} />
                              <label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                                <Icon className="h-4 w-4" />
                                {label}
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safety_critical"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Safety Critical</FormLabel>
                      <FormDescription>
                        {isInUse && isSafetyCritical
                          ? 'Cannot be unchecked while item is in use'
                          : 'Items marked as safety-critical cannot be removed from PM schedules'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isInUse && isSafetyCritical}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image (Optional)</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload safety sign or reference image</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG, SVG (max 2MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!canDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </FormDialogContent>
      </FormDialog>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Checklist Item"
        description={
          isInUse
            ? `This item is used in ${usageCount} PM schedule${usageCount > 1 ? 's' : ''}. Deleting it will remove it from all schedules. This action cannot be undone.`
            : 'Are you sure you want to delete this checklist item? This action cannot be undone.'
        }
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};
