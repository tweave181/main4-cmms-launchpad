import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmailTemplate } from '@/hooks/useEmailTemplates';

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate;
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  if (!template) return null;

  // Sample data for template variable replacement
  const sampleData: Record<string, string> = {
    contract_title: 'Annual Maintenance Contract',
    days_until_expiry: '30',
    user_name: 'John Doe',
    tenant_name: 'Acme Corporation',
    vendor_name: 'Service Provider Inc.',
  };

  // Replace template variables with sample data
  const replaceVariables = (text: string) => {
    let result = text;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  const previewSubject = replaceVariables(template.subject);
  const previewHtml = replaceVariables(template.body_html);
  const previewText = template.body_text ? replaceVariables(template.body_text) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Template Preview: {template.template_name}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {template.is_default && <Badge variant="outline">Default</Badge>}
            </div>
          </div>
          <DialogDescription>
            Preview of the email template with sample data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Subject:</h4>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{previewSubject}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">HTML Preview:</h4>
            <div
              className="p-4 bg-background border rounded-md overflow-auto max-h-96"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {previewText && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Plain Text Version:</h4>
                <div className="p-4 bg-muted rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{previewText}</pre>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Sample Data Used:</h4>
            <div className="p-3 bg-muted rounded-md">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(sampleData).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-mono text-muted-foreground">{`{{${key}}}`}</span>
                    <span>→</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
