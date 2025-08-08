
import React from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { InventoryPartForm } from './InventoryPartForm';
import type { Database } from '@/integrations/supabase/types';

type InventoryPartInsert = Omit<Database['public']['Tables']['inventory_parts']['Insert'], 'tenant_id' | 'created_by'>;

interface CreatePartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePart: (data: InventoryPartInsert) => Promise<void>;
  isCreating: boolean;
}

export const CreatePartModal: React.FC<CreatePartModalProps> = ({
  open,
  onOpenChange,
  onCreatePart,
  isCreating,
}) => {
  const handleCreatePart = async (data: InventoryPartInsert) => {
    try {
      await onCreatePart(data);
      onOpenChange(false); // Auto-close on success
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Add New Part</FormDialogTitle>
        </FormDialogHeader>
        <InventoryPartForm
          onSubmit={handleCreatePart}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isCreating}
        />
      </FormDialogContent>
    </FormDialog>
  );
};
