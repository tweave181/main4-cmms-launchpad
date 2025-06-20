
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { CompanyDetails } from '@/types/company';

interface CompanyHistoryModalProps {
  company: CompanyDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock audit log data - in a real implementation, this would come from the database
const getMockAuditLogs = (companyId: string) => [
  {
    id: '1',
    action: 'created',
    changed_by: 'John Doe',
    change_summary: 'Company created',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: '2', 
    action: 'updated',
    changed_by: 'Jane Smith',
    change_summary: 'Updated contact email from old@example.com to new@example.com',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: '3',
    action: 'updated', 
    changed_by: 'Mike Johnson',
    change_summary: 'Updated company type to include contractor',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const CompanyHistoryModal: React.FC<CompanyHistoryModalProps> = ({
  company,
  isOpen,
  onClose,
}) => {
  if (!company) return null;

  const auditLogs = getMockAuditLogs(company.id);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'created':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'deleted':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Change History: {company.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No change history available for this company.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.changed_by}</TableCell>
                    <TableCell className="max-w-md">
                      {log.change_summary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
