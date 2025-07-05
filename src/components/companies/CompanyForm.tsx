
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
import { Button } from '@/components/ui/button';
import { CompanyBasicFields } from './CompanyBasicFields';
import { CompanyContactFields } from './CompanyContactFields';
import { CompanyTypeFields } from './CompanyTypeFields';
import { CompanyAddressFields } from './CompanyAddressFields';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import type { CompanyDetails, CompanyFormData } from '@/types/company';

const companySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  company_address_id: z.string().optional(),
  company_address: z.object({
    address_line_1: z.string().min(1, 'Address line 1 is required'),
    address_line_2: z.string().optional(),
    address_line_3: z.string().optional(),
    town_or_city: z.string().optional(),
    county_or_state: z.string().optional(),
    postcode: z.string().optional(),
  }).optional(),
  type: z.array(z.string()).min(1, 'At least one company type is required'),
});

interface CompanyFormProps {
  company?: CompanyDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!company;
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: company?.company_name || '',
      contact_name: company?.contact_name || '',
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
      company_address_id: company?.company_address_id || '',
      company_address: company?.company_address ? {
        address_line_1: company.company_address.address_line_1 || '',
        address_line_2: company.company_address.address_line_2 || '',
        address_line_3: company.company_address.address_line_3 || '',
        town_or_city: company.company_address.town_or_city || '',
        county_or_state: company.company_address.county_or_state || '',
        postcode: company.company_address.postcode || '',
      } : {
        address_line_1: '',
        address_line_2: '',
        address_line_3: '',
        town_or_city: '',
        county_or_state: '',
        postcode: '',
      },
      type: company?.type || [],
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: company!.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Company' : 'Create New Company'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CompanyBasicFields control={form.control} />
            <CompanyContactFields control={form.control} />
            <CompanyAddressFields control={form.control} />
            <CompanyTypeFields control={form.control} />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
