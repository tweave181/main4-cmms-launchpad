
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobTitleAuditLog } from './JobTitleAuditLog';

interface JobTitleAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobTitleAuditLogModal: React.FC<JobTitleAuditLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Title Change History</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <JobTitleAuditLog />
        </div>
      </DialogContent>
    </Dialog>
  );
};
