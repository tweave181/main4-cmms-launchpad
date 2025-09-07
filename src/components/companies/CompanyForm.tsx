
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { CompanyWebsiteDescriptionFields } from './CompanyWebsiteDescriptionFields';
import { CompanyFormErrorBoundary } from './CompanyFormErrorBoundary';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import type { CompanyDetails, CompanyFormData } from '@/types/company';

// Development error handling
if (process.env.NODE_ENV !== 'production') {
  window.addEventListener('unhandledrejection', e => {
    console.error('Promise rejection:', e.reason);
  });
}

const companySchema = z.object({
  company_name: z.string().trim().min(2, 'Company name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  company_description: z.string().max(4000, 'Description must be 4000 characters or less').optional().or(z.literal('')),
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'onChange',
    defaultValues: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      company_website: '',
      company_description: '',
    },
  });

  const { handleSubmit, formState, reset } = form;
  const { isDirty, isSubmitting } = formState;

  useEffect(() => {
    if (company) {
      reset({
        company_name: company.company_name || '',
        contact_name: company.contact_name || '',
        email: company.email || '',
        phone: company.phone || '',
        company_website: company.company_website || '',
        company_description: company.company_description || '',
      });
    } else {
      reset({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        company_website: '',
        company_description: '',
      });
    }
  }, [company, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // Trim company name
      const payload = { 
        ...data, 
        company_name: data.company_name.trim()
      };
      
      if (isEditing && company) {
        const result = await updateMutation.mutateAsync({
          id: company.id,
          data: payload,
        });
        toast({ title: "Success", description: "Company updated successfully" });
        
        // Refresh the data
        queryClient.setQueryData(['company', company.id], result);
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Success", description: "Company created successfully" });
        
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || 'Failed to save company. Please try again.';
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  };

  const onInvalid = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    const element = document.querySelector(`[name="${firstErrorField}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    reset();
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Company' : 'Create Company')}
              </Button>
            </div>
          </DialogHeader>

          <CompanyFormErrorBoundary>
            <Form {...form}>
              <form id="company-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <CompanyBasicFields control={form.control} companyId={company?.id} />
                <CompanyContactFields control={form.control} />
                <CompanyWebsiteDescriptionFields control={form.control} />
              </form>
            </Form>
          </CompanyFormErrorBoundary>
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
