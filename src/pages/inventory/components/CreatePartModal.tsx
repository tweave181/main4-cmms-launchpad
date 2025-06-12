
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        <InventoryPartForm
          onSubmit={onCreatePart}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
};
