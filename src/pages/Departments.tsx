
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { DepartmentForm } from '@/components/departments/DepartmentForm';
import { DepartmentList } from '@/components/departments/DepartmentList';
import { useDepartments } from '@/hooks/useDepartments';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

const Departments: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const { departments, isLoading, refetch, deleteDepartment } = useDepartments();

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Building className="h-6 w-6 text-primary" />
              <span>Departments</span>
            </CardTitle>
            <Button onClick={handleCreateDepartment} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first department.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateDepartment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </div>
            </div>
          ) : (
            <DepartmentList
              departments={departments}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={deleteDepartment}
            />
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <DepartmentForm
          department={editingDepartment}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDepartment(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingDepartment(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Departments;
