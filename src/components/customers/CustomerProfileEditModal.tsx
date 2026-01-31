import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LookupData {
  departments: Array<{ id: string; name: string }>;
  job_titles: Array<{ id: string; title_name: string }>;
  locations: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string }>;
}

interface CustomerProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export const CustomerProfileEditModal: React.FC<CustomerProfileEditModalProps> = ({
  open,
  onOpenChange,
  customer,
}) => {
  const { updateProfile } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  
  const [formData, setFormData] = useState<Partial<CustomerFormData>>({
    email: customer.email || '',
    phone: customer.phone || '',
    phone_extension: customer.phone_extension || '',
    department_id: customer.department_id || '',
    job_title_id: customer.job_title_id || '',
    work_area_id: customer.work_area_id || '',
    reports_to: customer.reports_to || '',
  });

  // Fetch lookup data when modal opens
  useEffect(() => {
    if (open && !lookupData) {
      fetchLookupData();
    }
  }, [open]);

  // Reset form when customer changes
  useEffect(() => {
    setFormData({
      email: customer.email || '',
      phone: customer.phone || '',
      phone_extension: customer.phone_extension || '',
      department_id: customer.department_id || '',
      job_title_id: customer.job_title_id || '',
      work_area_id: customer.work_area_id || '',
      reports_to: customer.reports_to || '',
    });
  }, [customer]);

  const fetchLookupData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-auth', {
        body: { action: 'get_lookup_data', tenant_id: customer.tenant_id },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to load options');
      }

      setLookupData({
        departments: data.departments,
        job_titles: data.job_titles,
        locations: data.locations,
        customers: data.customers.filter((c: { id: string }) => c.id !== customer.id), // Exclude self
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load options',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateProfile({
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        phone_extension: formData.phone_extension || undefined,
        department_id: formData.department_id || undefined,
        job_title_id: formData.job_title_id || undefined,
        work_area_id: formData.work_area_id || undefined,
        reports_to: formData.reports_to || undefined,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === 'none' ? '' : value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_extension">Extension</Label>
                <Input
                  id="phone_extension"
                  value={formData.phone_extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_extension: e.target.value }))}
                  placeholder="Ext."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department_id || 'none'}
                onValueChange={(value) => handleSelectChange('department_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {lookupData?.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Select
                value={formData.job_title_id || 'none'}
                onValueChange={(value) => handleSelectChange('job_title_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {lookupData?.job_titles.map((title) => (
                    <SelectItem key={title.id} value={title.id}>
                      {title.title_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_area">Work Location</Label>
              <Select
                value={formData.work_area_id || 'none'}
                onValueChange={(value) => handleSelectChange('work_area_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {lookupData?.locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reports_to">Reports To</Label>
              <Select
                value={formData.reports_to || 'none'}
                onValueChange={(value) => handleSelectChange('reports_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {lookupData?.customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
