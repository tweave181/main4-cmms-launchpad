
import React from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useAssetForm } from './useAssetForm';
import { useFormDialog } from '@/hooks/useFormDialog';
import { AssetFormErrorBoundary } from './AssetFormErrorBoundary';
import { AssetBasicFields } from './AssetBasicFields';
import { AssetTechnicalFields } from './AssetTechnicalFields';
import { AssetFinancialFields } from './AssetFinancialFields';
import { AssetDescriptionFields } from './AssetDescriptionFields';
import { useAssetDropdownData } from './hooks/useAssetDropdownData';
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
  const dropdownData = useAssetDropdownData();
  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose,
  });

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="max-w-md">
          <FormDialogHeader>
            <FormDialogTitle>Loading Profile</FormDialogTitle>
          </FormDialogHeader>
          
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          <div className="flex justify-start space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </FormDialogContent>
      </FormDialog>
    );
  }

  // Show warning if user profile is not available after loading
  if (!userProfile?.tenant_id) {
    return (
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="max-w-md">
          <FormDialogHeader>
            <FormDialogTitle>Profile Error</FormDialogTitle>
          </FormDialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your user profile could not be loaded. Please try refreshing the page.
              If this problem persists, please contact support.
            </AlertDescription>
          </Alert>

          <div className="flex justify-start space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </FormDialogContent>
      </FormDialog>
    );
  }

  return (
    <>
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <FormDialogHeader>
            <FormDialogTitle>
              {isEditing ? 'Edit Asset' : 'Create New Asset'}
            </FormDialogTitle>
          </FormDialogHeader>

          <AssetFormErrorBoundary onRetry={handleRetry}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AssetBasicFields control={form.control} currentAssetId={asset?.id} />
                  <AssetTechnicalFields 
                    control={form.control}
                  />
                  <AssetFinancialFields 
                    control={form.control}
                    serviceContractsData={dropdownData.serviceContracts}
                  />
                </div>

                <AssetDescriptionFields control={form.control} />

                <div className="flex justify-start space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Update Asset' : 'Create Asset'}
                  </Button>
                </div>
              </form>
            </Form>
          </AssetFormErrorBoundary>
        </FormDialogContent>
      </FormDialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleGoBack}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
};
