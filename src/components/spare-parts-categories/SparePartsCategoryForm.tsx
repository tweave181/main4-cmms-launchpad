import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSparePartsCategories, type SparePartsCategory } from '@/hooks/useSparePartsCategories';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface SparePartsCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: SparePartsCategory | null;
}

export const SparePartsCategoryForm: React.FC<SparePartsCategoryFormProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { createCategory, updateCategory } = useSparePartsCategories();
  const isEditing = !!category;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      is_active: category?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [category, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ 
          id: category.id, 
          name: data.name,
          description: data.description,
          is_active: data.is_active
        });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          description: data.description,
          is_active: data.is_active
        });
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the spare parts category details.'
              : 'Create a new spare parts category for organizing inventory.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter category name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter category description"
                      rows={3}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Inactive categories won't appear in selection lists
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Category'
                  : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};