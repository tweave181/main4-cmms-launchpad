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
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import type { CompanyDetails } from '@/types/company';
import type { Database } from '@/integrations/supabase/types';

import type { WorkOrder, WorkOrderFormData, WorkOrderFilters } from '@/types/workOrder';
import type { Location } from '@/types/location';

type Asset = Database['public']['Tables']['assets']['Row'];

interface ContractorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorId: string;
  workOrder: WorkOrder;
}

export const ContractorDetailsModal: React.FC<ContractorDetailsModalProps> = ({
  isOpen,
  onClose,
  contractorId,
  workOrder,
}) => {
  const { formatDate, formatCurrency } = useGlobalSettings();
  const { data: contractors = [] } = useCompanies('contractor');
  const { userProfile } = useAuth();
  const contractor = contractors.find((c) => c.id === contractorId);

  // Fetch asset details if work order has an asset_id
  const { data: asset } = useQuery({
    queryKey: ['asset', workOrder.asset_id],
    queryFn: async () => {
      if (!workOrder.asset_id) return null;
      
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          location:locations(name, location_code)
        `)
        .eq('id', workOrder.asset_id)
        .single();

      if (error) throw error;
      return data as Asset & { location?: Location };
    },
    enabled: !!workOrder.asset_id && !!userProfile?.tenant_id,
  });

  if (!contractor) {
    return null;
  }

  const emailSubject = `Work Order ${workOrder.work_order_number}: ${workOrder.title}`;
  
  // Generate detailed email body
  const formatDateSafely = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    return formatDate(dateString);
  };

  // Format asset display
  const formatAssetDisplay = () => {
    if (!asset) return 'Not specified';
    const name = asset.name || 'Unknown Asset';
    const tag = asset.asset_tag ? `(${asset.asset_tag})` : '';
    return `${name} ${tag}`.trim();
  };

  // Get asset location
  const getAssetLocation = () => {
    if (!asset?.location) return 'Not specified';
    const locationCode = asset.location.location_code ? `[${asset.location.location_code}] ` : '';
    return locationCode + asset.location.name;
  };

  const emailBody = `Hello ${contractor.contact_name || contractor.company_name},%0A%0A` +
    `Please see the details of the work order below:%0A%0A` +
    `Work Order Number: ${workOrder.work_order_number}%0A` +
    `Work Order Title: ${workOrder.title}%0A` +
    `Description: ${workOrder.description || 'Not specified'}%0A` +
    `Asset: ${formatAssetDisplay()}%0A` +
    `Location: ${getAssetLocation()}%0A` +
    `Priority: ${workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}%0A` +
    `Work Type: ${workOrder.work_type.charAt(0).toUpperCase() + workOrder.work_type.slice(1)}%0A` +
    `Due Date: ${formatDate(workOrder.due_date)}%0A` +
    `Assigned By: ${userProfile?.name || 'System'}%0A%0A` +
    `Please reply or update us as soon as possible.%0A%0A` +
    `Thank you,%0A${userProfile?.name || 'Main4 CMMS Team'}`;

  const mailtoLink = `mailto:${contractor.email}?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;

  const logCommunicationEvent = async (method: 'phone' | 'email') => {
    try {
      if (!userProfile?.id) return;
      
      // Format asset info for the log
      const assetInfo = asset 
        ? `${asset.name || 'Unknown Asset'}${asset.asset_tag ? ` (${asset.asset_tag})` : ''}`
        : 'None';
      
      const actionText = method === 'email' ? 'Emailed Contractor' : 'Called Contractor';
      const comment = `${actionText} ${contractor.company_name} for ${workOrder.work_order_number} - Asset: ${assetInfo}`;
      
      await supabase.from('work_order_comments').insert({
        work_order_id: workOrder.id,
        user_id: userProfile.id,
        comment,
        comment_type: 'contact_event'
      });
    } catch (error) {
      console.error('Failed to log communication event:', error);
      // Don't block the user action if logging fails
    }
  };

  const handlePhoneClick = () => {
    logCommunicationEvent('phone');
    window.open(`tel:${contractor.phone}`, '_self');
  };

  const handleEmailClick = () => {
    logCommunicationEvent('email');
    window.open(mailtoLink, '_self');
  };

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
              <Badge variant="secondary" className="text-xs">No address types available</Badge>
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

            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="leading-relaxed">
                No address information available
              </span>
            </div>
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
                    onClick={handlePhoneClick}
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
                    onClick={handleEmailClick}
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