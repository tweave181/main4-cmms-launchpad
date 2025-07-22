
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
import { useAssetPrefixForm } from './useAssetPrefixForm';
import { AssetPrefixBasicFields } from './AssetPrefixBasicFields';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

interface AssetPrefixFormProps {
  prefix?: AssetTagPrefix | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssetPrefixForm: React.FC<AssetPrefixFormProps> = ({
  prefix,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { form, onSubmit, isEditing, isLoading, isPrefixInUse, isDuplicate } = useAssetPrefixForm({ 
    prefix, 
    onSuccess 
  });

  const handleClose = () => {
    form.reset();
    onClose();
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
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isDuplicate}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Prefix' : 'Create Prefix')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
