
import React from 'react';
import { Button } from '@/components/ui/button';

interface WorkOrderFormActionsProps {
  onCancel: () => void;
  loading?: boolean;
  isEditing?: boolean;
}

export const WorkOrderFormActions: React.FC<WorkOrderFormActionsProps> = ({
  onCancel,
  loading = false,
  isEditing = false,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );
};
