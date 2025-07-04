import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Phone, Mail, MapPin } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import type { CompanyDetails } from '@/types/company';

interface ContractorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorId: string;
}

export const ContractorDetailsModal: React.FC<ContractorDetailsModalProps> = ({
  isOpen,
  onClose,
  contractorId,
}) => {
  const { data: contractors = [] } = useCompanies('contractor');
  const contractor = contractors.find((c) => c.id === contractorId);

  if (!contractor) {
    return null;
  }

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
                  href={`mailto:${contractor.email}`}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};