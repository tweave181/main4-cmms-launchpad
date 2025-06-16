
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, type UserFormData } from './userFormSchema';

interface UseUserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
}

export const useUserForm = ({ initialData, onSubmit }: UseUserFormProps) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'technician',
      employment_status: initialData?.employment_status || 'Full Time',
      department_id: initialData?.department_id || 'none',
      phone_number: initialData?.phone_number || '',
      status: initialData?.status || 'active',
    },
  });

  const handleSubmit = (data: UserFormData) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      department_id: data.department_id === 'none' ? undefined : data.department_id,
      phone_number: data.phone_number === '' ? undefined : data.phone_number,
      employment_status: data.employment_status || 'Full Time',
    };
    onSubmit(cleanedData);
  };

  return {
    form,
    handleSubmit,
  };
};
