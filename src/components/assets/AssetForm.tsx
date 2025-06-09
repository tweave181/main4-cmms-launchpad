
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
import { AlertCircle, Loader2 } from 'lucide-react';
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
  const { userProfile, loading } = useAuth();
  const { form, onSubmit, isEditing } = useAssetForm({ asset, onSuccess });

  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Profile</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show warning if user profile is not available after loading
  if (!userProfile?.tenant_id) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Error</DialogTitle>
          </DialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your user profile could not be loaded. Please try refreshing the page.
              If this problem persists, please contact support.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
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
