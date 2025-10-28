import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { AddTimeRecordModal } from './AddTimeRecordModal';

interface QuickTimeLogButtonProps {
  workOrderId?: string;
  pmScheduleId?: string;
  maintenanceJobId?: string;
  assetId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const QuickTimeLogButton: React.FC<QuickTimeLogButtonProps> = ({
  workOrderId,
  pmScheduleId,
  maintenanceJobId,
  assetId,
  variant = 'default',
  size = 'default',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className="flex items-center space-x-2"
      >
        <Clock className="h-4 w-4" />
        <span>Log Time</span>
      </Button>

      <AddTimeRecordModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        workOrderId={workOrderId}
        pmScheduleId={pmScheduleId}
        maintenanceJobId={maintenanceJobId}
        assetId={assetId}
      />
    </>
  );
};
