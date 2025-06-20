
import React from 'react';
import {
  Dialog,
  DialogContent,
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
  const { form, onSubmit, isEditing } = useAssetPrefixForm({ prefix, onSuccess });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Asset Tag Prefix' : 'Create Asset Tag Prefix'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AssetPrefixBasicFields control={form.control} />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Prefix' : 'Create Prefix'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
