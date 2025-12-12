
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Tag } from 'lucide-react';
import { useCategories, Category } from '@/hooks/useCategories';
import { useNextNumberCode } from '@/components/asset-prefixes/hooks/useNextNumberCode';
import { cn } from '@/lib/utils';

const DEFAULT_PREFIX_LETTER = 'E';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  createPrefix: z.boolean().default(false),
  prefix_letter: z.string().max(1).optional(),
  number_code: z.string().max(3).optional(),
  prefix_description: z.string().max(200).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const { createCategory, updateCategory } = useCategories();
  const isEditing = !!category;
  const [createPrefix, setCreatePrefix] = useState(false);
  const [prefixLetter, setPrefixLetter] = useState(DEFAULT_PREFIX_LETTER);
  
  const { data: nextNumber } = useNextNumberCode(createPrefix ? prefixLetter : '');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      createPrefix: false,
      prefix_letter: DEFAULT_PREFIX_LETTER,
      number_code: '1',
      prefix_description: '',
    },
  });

  // Watch category name to auto-fill prefix description
  const categoryName = form.watch('name');

  // Update prefix description when category name changes
  useEffect(() => {
    if (createPrefix && categoryName) {
      form.setValue('prefix_description', categoryName);
    }
  }, [categoryName, createPrefix, form]);

  // Update number code when next available number is calculated
  useEffect(() => {
    if (nextNumber) {
      form.setValue('number_code', nextNumber.toString());
    }
  }, [nextNumber, form]);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: category?.name || '',
        description: category?.description || '',
        createPrefix: false,
        prefix_letter: DEFAULT_PREFIX_LETTER,
        number_code: nextNumber?.toString() || '1',
        prefix_description: category?.name || '',
      });
      setCreatePrefix(false);
      setPrefixLetter(DEFAULT_PREFIX_LETTER);
    }
  }, [isOpen, category, form, nextNumber]);

  const handlePrefixLetterChange = (value: string) => {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    setPrefixLetter(letter || DEFAULT_PREFIX_LETTER);
    form.setValue('prefix_letter', letter || DEFAULT_PREFIX_LETTER);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          name: data.name,
          description: data.description,
        });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          description: data.description,
          createPrefix: createPrefix,
          prefix_letter: createPrefix ? data.prefix_letter : undefined,
          number_code: createPrefix ? data.number_code : undefined,
          prefix_description: createPrefix ? data.prefix_description : undefined,
        });
      }
      form.reset();
      setCreatePrefix(false);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    form.reset();
    setCreatePrefix(false);
    onClose();
  };

  const previewTag = prefixLetter && form.watch('number_code')
    ? `${prefixLetter}${(form.watch('number_code') || '1').padStart(3, '0')}/001`
    : 'E001/001';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Category name" 
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      {...field} 
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
                      placeholder="Category description (optional)"
                      rows={3}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Prefix Creation - Only show when creating new category */}
            {!isEditing && (
              <Collapsible open={createPrefix} onOpenChange={setCreatePrefix}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox 
                      checked={createPrefix} 
                      onCheckedChange={(checked) => setCreatePrefix(!!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">Also create an Asset Tag Prefix</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      createPrefix && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prefix_letter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefix Letter</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={prefixLetter}
                              onChange={(e) => handlePrefixLetterChange(e.target.value)}
                              placeholder="E"
                              className="text-center font-mono uppercase"
                              maxLength={1}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              onChange={(e) => {
                                const num = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                                field.onChange(num);
                              }}
                              placeholder="1"
                              className="text-center font-mono"
                              maxLength={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="prefix_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefix Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Prefix description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground">
                    Preview: <span className="font-mono font-medium">{previewTag}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex justify-start space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending 
                  ? 'Saving...' 
                  : (isEditing ? 'Update Category' : 'Create Category')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
