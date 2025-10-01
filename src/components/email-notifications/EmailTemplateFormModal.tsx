import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateEmailTemplate, useUpdateEmailTemplate, EmailTemplate } from '@/hooks/useEmailTemplates';
import { Loader2 } from 'lucide-react';

const templateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  template_type: z.string().min(1, 'Template type is required'),
  subject: z.string().min(1, 'Subject is required'),
  body_html: z.string().min(1, 'HTML body is required'),
  body_text: z.string().optional(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EmailTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate;
}

export const EmailTemplateFormModal: React.FC<EmailTemplateFormModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const isEditMode = !!template;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template
      ? {
          template_name: template.template_name,
          template_type: template.template_type,
          subject: template.subject,
          body_html: template.body_html,
          body_text: template.body_text || '',
          is_active: template.is_active,
          is_default: template.is_default,
        }
      : {
          template_name: '',
          template_type: 'contract_reminder',
          subject: '',
          body_html: '',
          body_text: '',
          is_active: true,
          is_default: false,
        },
  });

  React.useEffect(() => {
    if (template) {
      reset({
        template_name: template.template_name,
        template_type: template.template_type,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text || '',
        is_active: template.is_active,
        is_default: template.is_default,
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const templateData = {
        template_name: data.template_name,
        template_type: data.template_type,
        subject: data.subject,
        body_html: data.body_html,
        body_text: data.body_text || '',
        is_active: data.is_active,
        is_default: data.is_default,
      };

      if (isEditMode && template) {
        await updateMutation.mutateAsync({
          id: template.id,
          data: templateData,
        });
      } else {
        await createMutation.mutateAsync(templateData);
      }
      onClose();
      reset();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const templateType = watch('template_type');
  const isActive = watch('is_active');
  const isDefault = watch('is_default');

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Template' : 'Create Template'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the email template details below.'
              : 'Create a new email template for notifications.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name</Label>
            <Input
              id="template_name"
              {...register('template_name')}
              placeholder="e.g., Contract Expiry Reminder"
            />
            {errors.template_name && (
              <p className="text-sm text-destructive">{errors.template_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_type">Template Type</Label>
            <Select
              value={templateType}
              onValueChange={(value) => setValue('template_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract_reminder">Contract Reminder</SelectItem>
                <SelectItem value="user_invitation">User Invitation</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {errors.template_type && (
              <p className="text-sm text-destructive">{errors.template_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., Your contract expires in {{days_until_expiry}} days"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Available variables: {'{{contract_title}}'}, {'{{days_until_expiry}}'}, {'{{user_name}}'}, {'{{tenant_name}}'}, {'{{vendor_name}}'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_html">HTML Body</Label>
            <Textarea
              id="body_html"
              {...register('body_html')}
              placeholder="Enter HTML email template..."
              rows={8}
              className="font-mono text-sm"
            />
            {errors.body_html && (
              <p className="text-sm text-destructive">{errors.body_html.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_text">Plain Text Body (Optional)</Label>
            <Textarea
              id="body_text"
              {...register('body_text')}
              placeholder="Enter plain text version..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Fallback for email clients that don't support HTML
            </p>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={isDefault}
                onCheckedChange={(checked) => setValue('is_default', checked)}
              />
              <Label htmlFor="is_default">Set as Default</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
