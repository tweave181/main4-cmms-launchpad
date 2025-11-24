import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { EmailDeliveryLog } from '@/types/email';

interface EmailLogDetailModalProps {
  log: EmailDeliveryLog | null;
  open: boolean;
  onClose: () => void;
}

export const EmailLogDetailModal: React.FC<EmailLogDetailModalProps> = ({ log, open, onClose }) => {
  if (!log) return null;

  const getStatusIcon = (status: string | null) => {
    if (!status) return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'opened') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (statusLower === 'failed') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-start gap-3">
            {getStatusIcon(log.delivery_status)}
            <div className="flex-1">
              <div className="font-medium">Delivery Status</div>
              <div className="text-sm text-muted-foreground capitalize">
                {log.delivery_status || 'Unknown'}
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipient */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">Recipient</div>
              <div className="text-sm">
                {log.recipient_name && (
                  <div className="font-medium">{log.recipient_name}</div>
                )}
                <div className="text-muted-foreground">{log.recipient_email}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <div className="font-medium mb-2">Subject</div>
            <div className="text-sm bg-muted p-3 rounded-lg">{log.subject}</div>
          </div>

          {/* Template Info */}
          {log.template_type && (
            <>
              <Separator />
              <div>
                <div className="font-medium mb-2">Template</div>
                <div className="flex items-center gap-2">
                  <Badge>{log.template_type.replace(/_/g, ' ')}</Badge>
                  {log.template_name && (
                    <span className="text-sm text-muted-foreground">
                      ({log.template_name})
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), 'PPpp')}
                  </div>
                </div>
                
                {log.sent_at && (
                  <div>
                    <div className="text-sm font-medium">Sent</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(log.sent_at), 'PPpp')}
                    </div>
                  </div>
                )}
                
                {log.delivered_at && (
                  <div>
                    <div className="text-sm font-medium">Delivered</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(log.delivered_at), 'PPpp')}
                    </div>
                  </div>
                )}
                
                {log.opened_at && (
                  <div>
                    <div className="text-sm font-medium">Opened</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(log.opened_at), 'PPpp')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {log.error_message && (
            <>
              <Separator />
              <div>
                <div className="font-medium mb-2 text-red-600">Error Message</div>
                <div className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg text-red-900 dark:text-red-200">
                  {log.error_message}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
