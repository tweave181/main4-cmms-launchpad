
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, ChevronRight } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

interface DepartmentClickableListProps {
  departments: Department[];
  onDepartmentClick: (departmentId: string) => void;
}

export const DepartmentClickableList: React.FC<DepartmentClickableListProps> = ({
  departments,
  onDepartmentClick,
}) => {
  return (
    <div className="space-y-3">
      {departments.map((department) => (
        <Card 
          key={department.id} 
          className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onDepartmentClick(department.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Building className="h-6 w-6 text-primary flex-shrink-0" />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{department.name}</h3>
                {department.description && (
                  <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                )}
              </div>
              
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
