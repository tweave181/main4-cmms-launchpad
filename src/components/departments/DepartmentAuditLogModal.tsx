
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DepartmentAuditLog } from './DepartmentAuditLog';

interface DepartmentAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentAuditLogModal: React.FC<DepartmentAuditLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Department Change History</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DepartmentAuditLog />
        </div>
      </DialogContent>
    </Dialog>
  );
};
