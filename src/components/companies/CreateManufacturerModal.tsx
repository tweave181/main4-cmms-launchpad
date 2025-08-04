import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateCompany } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/auth';

const manufacturerSchema = z.object({
  company_name: z.string().min(1, 'Manufacturer name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type ManufacturerFormData = z.infer<typeof manufacturerSchema>;

interface CreateManufacturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (manufacturerId: string) => void;
}

export const CreateManufacturerModal: React.FC<CreateManufacturerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile } = useAuth();
  const createCompany = useCreateCompany();
  
  // Check if user has permission to create manufacturers
  const canCreateManufacturer = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  const form = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: ManufacturerFormData) => {
    try {
      const manufacturerData = {
        company_name: data.company_name,
        type: ['manufacturer'],
        email: data.email || undefined,
        contact_name: data.contact_name || undefined,
        phone: data.phone || undefined,
      };

      const result = await createCompany.mutateAsync(manufacturerData);
      onSuccess(result.id);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating manufacturer:', error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  if (!canCreateManufacturer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Manufacturer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter manufacturer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-start space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={createCompany.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCompany.isPending}
              >
                {createCompany.isPending ? 'Creating...' : 'Create Manufacturer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};