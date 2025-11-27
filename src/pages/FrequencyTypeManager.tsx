import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FrequencyTypeList } from '@/components/frequency-types/FrequencyTypeList';
import { FrequencyTypeForm } from '@/components/frequency-types/FrequencyTypeForm';
import { useFrequencyTypes } from '@/hooks/useFrequencyTypes';
import type { FrequencyType } from '@/hooks/useFrequencyTypes';

const FrequencyTypeManager = () => {
  const { data: frequencyTypes, isLoading } = useFrequencyTypes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<FrequencyType | undefined>();

  const handleEdit = (type: FrequencyType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingType(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingType(undefined);
  };

  if (isLoading) {
    return <div className="p-8">Loading frequency types...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Frequency Types</h1>
          <p className="text-muted-foreground mt-2">
            Manage maintenance frequency types used in checklist records
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Frequency Type
        </Button>
      </div>

      <FrequencyTypeList
        frequencyTypes={frequencyTypes || []}
        onEdit={handleEdit}
      />

      <FrequencyTypeForm
        open={isFormOpen}
        onClose={handleCloseForm}
        editingType={editingType}
      />
    </div>
  );
};

export default FrequencyTypeManager;
