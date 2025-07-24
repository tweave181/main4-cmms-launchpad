import { useState } from 'react';

interface UseFormDialogProps {
  onClose: () => void;
}

export const useFormDialog = ({ onClose }: UseFormDialogProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCancel = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    onClose();
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
  };

  return {
    showConfirmation,
    handleCancel,
    handleConfirmCancel,
    handleGoBack,
  };
};