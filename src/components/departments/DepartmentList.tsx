
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Edit, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

interface DepartmentListProps {
  departments: Department[];
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (departmentId: string) => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  onEditDepartment,
  onDeleteDepartment,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((department) => (
        <Card key={department.id} className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{department.name}</h3>
            </div>
            
            {department.description && (
              <p className="text-sm text-gray-600 mb-4">{department.description}</p>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditDepartment(department)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteDepartment(department.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
