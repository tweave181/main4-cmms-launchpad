
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { DepartmentForm } from '@/components/departments/DepartmentForm';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { data: department, isLoading, refetch } = useQuery({
    queryKey: ['department', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Department;
    },
    enabled: !!id && !!userProfile?.tenant_id,
  });

  const checkDepartmentUsage = async () => {
    if (!id) return false;
    
    // Check if department is referenced by users
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('department_id', id)
      .limit(1);

    if (error) throw error;
    return users && users.length > 0;
  };

  const handleDelete = async () => {
    if (!id || !department) return;

    try {
      const isInUse = await checkDepartmentUsage();
      
      if (isInUse) {
        toast({
          title: "Cannot Delete Department",
          description: "This department is assigned to users and cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      if (!confirm(`Are you sure you want to delete "${department.name}"?`)) {
        return;
      }

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      
      navigate('/departments');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsEditFormOpen(false);
    refetch();
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

  if (!department) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500">Department not found</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/departments')}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Departments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/departments')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Building className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-semibold">
                {department.name}
              </CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditFormOpen(true)}
                className="rounded-2xl"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline"
                onClick={handleDelete}
                className="rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Department Name</label>
                <p className="text-lg font-semibold mt-1">{department.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1">{department.description || 'No description provided'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1">{format(new Date(department.created_at), 'PPP p')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1">{format(new Date(department.updated_at), 'PPP p')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditFormOpen && (
        <DepartmentForm
          department={department}
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default DepartmentDetails;
