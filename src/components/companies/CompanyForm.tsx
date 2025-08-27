
import React, { useState, useEffect } from 'react';
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
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CompanyBasicFields } from './CompanyBasicFields';
import { CompanyContactFields } from './CompanyContactFields';
import { CompanyTypeFields } from './CompanyTypeFields';
import { CompanyAddressFields } from './CompanyAddressFields';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import type { CompanyDetails, CompanyFormData } from '@/types/company';

const companySchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters').max(120, 'Company name must be less than 120 characters'),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_address_id: z.string().min(1, 'Company address is required'),
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
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: company?.company_name || '',
      contact_name: company?.contact_name || '',
      email: company?.email || '',
      phone: company?.phone || '',
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

  const { isDirty } = form.formState;

  useEffect(() => {
    if (company) {
      form.reset({
        company_name: company.company_name || '',
        contact_name: company.contact_name || '',
        email: company.email || '',
        phone: company.phone || '',
        company_address_id: company.company_address_id || '',
        company_address: company.company_address ? {
          address_line_1: company.company_address.address_line_1 || '',
          address_line_2: company.company_address.address_line_2 || '',
          address_line_3: company.company_address.address_line_3 || '',
          town_or_city: company.company_address.town_or_city || '',
          county_or_state: company.company_address.county_or_state || '',
          postcode: company.company_address.postcode || '',
        } : undefined,
        type: company.type || [],
      });
    }
  }, [company, form]);

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

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedChanges(false);
    form.reset();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 z-10 bg-background border-b pb-4 mb-4 flex flex-row items-center justify-between space-y-0">
            <DialogTitle>
              {isEditing ? 'Edit Company' : 'Add Company'}
            </DialogTitle>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="company-form"
                disabled={createMutation.isPending || updateMutation.isPending || !form.formState.isValid}
              >
                {isEditing ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form id="company-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CompanyBasicFields control={form.control} />
              <CompanyContactFields control={form.control} />
              <CompanyAddressFields control={form.control} />
              <CompanyTypeFields control={form.control} />
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showUnsavedChanges}
        onClose={() => setShowUnsavedChanges(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Close without saving"
        variant="destructive"
      />
    </>
  );
};
