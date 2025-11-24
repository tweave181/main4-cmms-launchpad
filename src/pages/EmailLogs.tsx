import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Download, Loader2 } from 'lucide-react';
import { useEmailLogs } from '@/hooks/useEmailLogs';
import { EmailLogsFilters } from '@/components/email-logs/EmailLogsFilters';
import { EmailLogsTable } from '@/components/email-logs/EmailLogsTable';
import { EmailLogDetailModal } from '@/components/email-logs/EmailLogDetailModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import type { EmailDeliveryLog } from '@/types/email';

export default function EmailLogs() {
  const [status, setStatus] = useState('all');
  const [templateType, setTemplateType] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<EmailDeliveryLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data, isLoading, error } = useEmailLogs({
    status: status === 'all' ? undefined : status,
    templateType: templateType === 'all' ? undefined : templateType,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    pageSize: 50,
  });

  const handleReset = () => {
    setStatus('all');
    setTemplateType('all');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleViewDetails = (log: EmailDeliveryLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvHeaders = ['Timestamp', 'Recipient', 'Subject', 'Status', 'Type', 'Error'];
    const csvRows = data.data.map(log => [
      new Date(log.created_at).toISOString(),
      log.recipient_email,
      log.subject,
      log.delivery_status || '',
      log.template_type || '',
      log.error_message || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Email logs exported successfully');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="h-8 w-8" />
            Email Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all email delivery logs
          </p>
        </div>
        
        <Button onClick={handleExport} disabled={isLoading || !data?.data?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailLogsFilters
            status={status}
            templateType={templateType}
            search={search}
            startDate={startDate}
            endDate={endDate}
            onStatusChange={setStatus}
            onTemplateTypeChange={setTemplateType}
            onSearchChange={setSearch}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Delivery History</span>
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                {data.total} total logs
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Failed to load email logs
            </div>
          ) : (
            <>
              <EmailLogsTable
                logs={data?.data || []}
                onViewDetails={handleViewDetails}
              />

              {data && data.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                          className={page === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EmailLogDetailModal
        log={selectedLog}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
