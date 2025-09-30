import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const EmailTemplatesSection: React.FC = () => {
  const { data: templates, isLoading } = useEmailTemplates();

  const getTemplateTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      contract_reminder: 'bg-blue-500',
      user_invitation: 'bg-green-500',
      password_reset: 'bg-yellow-500',
      welcome: 'bg-purple-500',
      maintenance: 'bg-orange-500',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-500'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Email Templates</CardTitle>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
        <CardDescription>
          Manage email templates for different notification types
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : templates && templates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {template.template_name}
                    {template.is_default && (
                      <Badge variant="outline" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getTemplateTypeBadge(template.template_type)}</TableCell>
                  <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No email templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
