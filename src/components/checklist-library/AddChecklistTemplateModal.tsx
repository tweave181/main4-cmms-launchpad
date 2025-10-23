import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, AlertTriangle } from 'lucide-react';
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
import { useCreateChecklistTemplate, useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { getTypeIcon, getTypeLabel } from './ChecklistTypeIcons';
import type { ChecklistItemType } from '@/types/checklistTemplate';

const formSchema = z.object({
  item_text: z.string().min(1, 'Item text is required').max(200, 'Item text must be 200 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  item_type: z.enum(['safety_note', 'checkbox', 'to_do', 'reading'] as const),
  safety_critical: z.boolean(),
  image_name: z.string().max(100, 'Image name must be 100 characters or less').regex(/^[^/\\:*?"<>|]*$/, 'Image name contains invalid characters').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddChecklistTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddChecklistTemplateModal: React.FC<AddChecklistTemplateModalProps> = ({ open, onOpenChange }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [similarItems, setSimilarItems] = useState<string[]>([]);

  const createMutation = useCreateChecklistTemplate();
  const { data: existingTemplates } = useChecklistTemplates();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_text: '',
      description: '',
      item_type: 'checkbox',
      safety_critical: false,
      image_name: '',
    },
  });

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

  const checkForDuplicates = (text: string) => {
    if (!existingTemplates || text.length < 3) {
      setSimilarItems([]);
      return;
    }

    const similar = existingTemplates
      .filter(t => t.item_text.toLowerCase().includes(text.toLowerCase()))
      .map(t => t.item_text)
      .slice(0, 3);

    setSimilarItems(similar);
  };

  const handleSubmit = (data: FormData) => {
    const submitData: Parameters<typeof createMutation.mutate>[0] = {
      item_text: data.item_text,
      description: data.description,
      item_type: data.item_type,
      safety_critical: data.safety_critical,
      image_file: imageFile || undefined,
      image_name: data.image_name || data.item_text,
    };
    
    createMutation.mutate(submitData, {
      onSuccess: () => {
        form.reset();
        setImageFile(null);
        setImagePreview(null);
        setSimilarItems([]);
        onOpenChange(false);
      },
    });
  };

  const itemTypes: ChecklistItemType[] = ['safety_note', 'checkbox', 'to_do', 'reading'];

  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Add Checklist Item to Library</FormDialogTitle>
        </FormDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="item_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Text *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Check for physical damage"
                      onChange={(e) => {
                        field.onChange(e);
                        checkForDuplicates(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Clear, concise description of the checklist item</FormDescription>
                  <FormMessage />
                  {similarItems.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium mb-1">Similar items found:</p>
                        <ul className="text-sm space-y-1">
                          {similarItems.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
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
                    <Textarea
                      {...field}
                      placeholder="Additional details or instructions..."
                      rows={3}
                    />
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
                      Items marked as safety-critical cannot be removed from PM schedules once added
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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

            {imageFile && (
              <FormField
                control={form.control}
                name="image_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Wear Protected Glasses"
                        maxLength={100}
                      />
                    </FormControl>
                    <FormDescription>
                      Custom name for the image file. Defaults to item text if not provided.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Form>
      </FormDialogContent>
    </FormDialog>
  );
};
