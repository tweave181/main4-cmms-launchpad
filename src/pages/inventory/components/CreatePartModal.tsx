
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
  onCreatePart: (data: InventoryPartInsert) => void;
  isCreating: boolean;
}

export const CreatePartModal: React.FC<CreatePartModalProps> = ({
  open,
  onOpenChange,
  onCreatePart,
  isCreating,
}) => {
  return (
    <FormDialog open={open} onOpenChange={() => {}}>
      <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Add New Part</FormDialogTitle>
        </FormDialogHeader>
        <InventoryPartForm
          onSubmit={onCreatePart}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isCreating}
        />
      </FormDialogContent>
    </FormDialog>
  );
};
