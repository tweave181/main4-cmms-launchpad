
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useAssetForm } from './useAssetForm';
import { AssetBasicFields } from './AssetBasicFields';
import { AssetTechnicalFields } from './AssetTechnicalFields';
import { AssetFinancialFields } from './AssetFinancialFields';
import { AssetDescriptionFields } from './AssetDescriptionFields';
import type { Asset } from './types';

interface AssetFormProps {
  asset?: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile } = useAuth();
  const { form, onSubmit, isEditing } = useAssetForm({ asset, onSuccess });

  // Show warning if user profile is not available
  if (!userProfile?.tenant_id) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Loading</DialogTitle>
          </DialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your user profile is still loading. Please wait a moment and try again.
              If this persists, try refreshing the page.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Asset' : 'Create New Asset'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetBasicFields control={form.control} />
              <AssetTechnicalFields control={form.control} />
              <AssetFinancialFields control={form.control} />
            </div>

            <AssetDescriptionFields control={form.control} />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Asset' : 'Create Asset'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
