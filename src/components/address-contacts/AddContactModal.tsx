import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAddressContact, useUpdateAddressContact } from '@/hooks/useAddressContacts';
import { useToast } from '@/hooks/use-toast';
import type { AddressContact, AddressContactFormData } from '@/types/addressContact';

const contactSchema = z.object({
  title: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  job_title: z.string().optional(),
  department: z.string().optional(),
  telephone: z.string().optional(),
  extension: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  general_notes: z.string().optional(),
  is_primary: z.boolean().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressId: string;
  contact?: AddressContact | null;
}

const titleOptions = [
  'Mr', 'Ms', 'Mrs', 'Miss', 'Dr', 'Prof', 'Sir', 'Dame'
];

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  addressId,
  contact,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateAddressContact();
  const updateMutation = useUpdateAddressContact();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      title: '',
      name: '',
      job_title: '',
      department: '',
      telephone: '',
      extension: '',
      mobile: '',
      email: '',
      general_notes: '',
      is_primary: false,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      const formData = {
        title: contact?.title || '',
        name: contact?.name || '',
        job_title: contact?.job_title || '',
        department: contact?.department || '',
        telephone: contact?.telephone || '',
        extension: contact?.extension || '',
        mobile: contact?.mobile || '',
        email: contact?.email || '',
        general_notes: contact?.general_notes || '',
        is_primary: contact?.is_primary || false,
      } as ContactFormData;
      form.reset(formData);
    }
  }, [isOpen, contact, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactData = data as AddressContactFormData;
      
      if (contact) {
        await updateMutation.mutateAsync({
          id: contact.id,
          contactData,
        });
        toast({
          title: 'Success',
          description: 'Contact updated successfully.',
        });
      } else {
        await createMutation.mutateAsync({
          addressId,
          contactData,
        });
        toast({
          title: 'Success',
          description: 'Contact created successfully.',
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: contact ? 'Failed to update contact.' : 'Failed to create contact.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titleOptions.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extension</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Primary Contact
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Mark this as the primary contact for this address
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {contact ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};