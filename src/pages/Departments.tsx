import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus, History, Upload } from 'lucide-react';
import { DepartmentClickableList } from '@/components/departments/DepartmentClickableList';
import { DepartmentForm } from '@/components/departments/DepartmentForm';
import { DepartmentAuditLogModal } from '@/components/departments/DepartmentAuditLogModal';
import { DepartmentImportModal } from '@/components/departments/DepartmentImportModal';
import { useDepartments } from '@/hooks/useDepartments';

const Departments: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const {
    departments,
    isLoading,
    refetch
  } = useDepartments();
  const handleCreateDepartment = () => {
    setIsFormOpen(true);
  };
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };
  const handleDepartmentClick = (departmentId: string) => {
    navigate(`/admin/preferences/departments/${departmentId}`);
  };
  if (isLoading) {
    return <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  return <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4 border-card">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Building className="h-6 w-6 text-primary" />
              <span>Departments List</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(true)} className="rounded-2xl">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={handleCreateDepartment} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DepartmentClickableList departments={departments} onDepartmentClick={handleDepartmentClick} />
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsAuditLogOpen(true)} className="rounded-2xl">
              <History className="w-4 h-4 mr-2" />
              Click to see the Department Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && <DepartmentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={handleFormSuccess} />}

      <DepartmentAuditLogModal isOpen={isAuditLogOpen} onClose={() => setIsAuditLogOpen(false)} />

      <DepartmentImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onSuccess={() => {
          setIsImportOpen(false);
          refetch();
        }}
        existingDepartments={departments}
      />
    </div>;
};
export default Departments;