
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];
type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface UseDepartmentFormProps {
  department?: Department | null;
  onSuccess: () => void;
}

export const useDepartmentForm = ({ department, onSuccess }: UseDepartmentFormProps) => {
  const { userProfile } = useAuth();
  const isEditing = !!department;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const departmentData: DepartmentInsert = {
        name: data.name,
        description: data.description,
        tenant_id: userProfile.tenant_id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('departments')
          .update(departmentData)
          .eq('id', department!.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('departments')
          .insert(departmentData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Department operation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
  };
};
