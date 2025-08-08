
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useInventoryPartForm } from './useInventoryPartForm';
import { useFormDialog } from '@/hooks/useFormDialog';
import { InventoryPartBasicFields } from './InventoryPartBasicFields';
import { InventoryPartQuantityFields } from './InventoryPartQuantityFields';
import { InventoryPartLocationFields } from './InventoryPartLocationFields';
import type { Database } from '@/integrations/supabase/types';

type InventoryPartData = Omit<Database['public']['Tables']['inventory_parts']['Insert'], 'tenant_id' | 'created_by'>;

interface InventoryPartFormProps {
  initialData?: Partial<InventoryPartData>;
  onSubmit: (data: InventoryPartData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const InventoryPartForm: React.FC<InventoryPartFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { form, handleSubmit } = useInventoryPartForm({ initialData, onSubmit });
  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose: onCancel,
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InventoryPartBasicFields control={form.control} />
          <InventoryPartQuantityFields control={form.control} />
          <InventoryPartLocationFields control={form.control} />

          <div className="flex justify-start space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Part' : 'Create Part'}
            </Button>
          </div>
        </form>
      </Form>

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
