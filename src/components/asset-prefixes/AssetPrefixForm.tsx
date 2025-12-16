
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAssetPrefixForm } from './useAssetPrefixForm';
import { AssetPrefixBasicFields } from './AssetPrefixBasicFields';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

interface AssetPrefixFormProps {
  prefix?: AssetTagPrefix | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export const AssetPrefixForm: React.FC<AssetPrefixFormProps> = ({
  prefix,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const { form, onSubmit, isEditing, isLoading, isPrefixInUse, isDuplicate } = useAssetPrefixForm({ 
    prefix, 
    onSuccess 
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleDelete = async () => {
    if (!prefix || !onDelete) return;
    
    if (isPrefixInUse) {
      toast({
        title: 'Cannot Delete Prefix',
        description: 'This prefix is currently used by assets. Please reassign or remove these assets first.',
        variant: 'destructive'
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete the prefix "${prefix.prefix_letter}${parseInt(prefix.number_code)}"?`)) {
      try {
        await onDelete(prefix.id);
        toast({
          title: 'Success',
          description: 'Asset tag prefix deleted successfully'
        });
        handleClose();
      } catch (error) {
        console.error('Error deleting prefix:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete asset tag prefix. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Asset Tag Prefix' : 'Create Asset Tag Prefix'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modify the asset tag prefix details. Note that prefixes in use cannot have their letter or number changed.'
              : 'Create a new asset tag prefix to organize your assets. Each prefix can support up to 999 assets.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AssetPrefixBasicFields 
              control={form.control} 
              isPrefixInUse={isPrefixInUse}
              isDuplicate={isDuplicate}
              form={form}
              isEditing={isEditing}
            />

            <div className="flex justify-between pt-4">
              <div>
                {isEditing && onDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isPrefixInUse}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isPrefixInUse && (
                        <TooltipContent>
                          <p>Cannot delete - prefix is used by assets</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isDuplicate}>
                  {isLoading ? 'Saving...' : (isEditing ? 'Update Prefix' : 'Create Prefix')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
