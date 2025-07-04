import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, Phone, Mail, MapPin } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import type { CompanyDetails } from '@/types/company';

interface ContractorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorId: string;
  workOrderTitle: string;
}

export const ContractorDetailsModal: React.FC<ContractorDetailsModalProps> = ({
  isOpen,
  onClose,
  contractorId,
  workOrderTitle,
}) => {
  const { data: contractors = [] } = useCompanies('contractor');
  const contractor = contractors.find((c) => c.id === contractorId);

  if (!contractor) {
    return null;
  }

  const emailSubject = `Work Order: ${workOrderTitle}`;
  const mailtoLink = `mailto:${contractor.email}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contractor Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{contractor.company_name}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {contractor.type.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {contractor.contact_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{contractor.contact_name}</span>
              </div>
            )}

            {contractor.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${contractor.phone}`}
                  className="text-primary hover:underline"
                >
                  {contractor.phone}
                </a>
              </div>
            )}

            {contractor.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={mailtoLink}
                  className="text-primary hover:underline"
                >
                  {contractor.email}
                </a>
              </div>
            )}

            {contractor.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="leading-relaxed">{contractor.address}</span>
              </div>
            )}
          </div>

          {/* Quick Contact Actions */}
          {(contractor.phone || contractor.email) && (
            <div className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2">
                {contractor.phone && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(`tel:${contractor.phone}`, '_self')}
                  >
                    <Phone className="h-4 w-4" />
                    Call Contractor
                  </Button>
                )}
                
                {contractor.email && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(mailtoLink, '_self')}
                  >
                    <Mail className="h-4 w-4" />
                    Email Contractor
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};