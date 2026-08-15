import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Boxes, Plus, Loader2 } from 'lucide-react';
import { EquipmentCategoryList } from '@/components/equipment-categories/EquipmentCategoryList';
import { EquipmentCategoryForm } from '@/components/equipment-categories/EquipmentCategoryForm';
import {
  useEquipmentCategories,
  type EquipmentCategory,
} from '@/hooks/useEquipmentCategories';
import { useAuth } from '@/contexts/auth';

const EquipmentCategories: React.FC = () => {
  const { categories, isLoading, setStatus } = useEquipmentCategories();
  const { isAdmin } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentCategory | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: EquipmentCategory) => {
    setEditing(category);
    setIsFormOpen(true);
  };

  const handleToggle = (category: EquipmentCategory) => {
    setStatus.mutate({
      id: category.id,
      status: category.status === 'active' ? 'inactive' : 'active',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Boxes className="h-6 w-6 text-primary" />
              <span>Equipment Categories</span>
            </CardTitle>
            {isAdmin && (
              <Button onClick={handleAdd} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Each equipment category owns a unique tag prefix (e.g. E7) and automatically
            generates sequential asset tags such as E7/004 when assets are created.
          </p>

          <EquipmentCategoryList
            categories={categories}
            onEdit={handleEdit}
            onToggleStatus={handleToggle}
            canManage={!!isAdmin}
          />
        </CardContent>
      </Card>

      <EquipmentCategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        category={editing}
      />
    </div>
  );
};

export default EquipmentCategories;
