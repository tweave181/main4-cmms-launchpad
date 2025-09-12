import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit, Trash2, Star, Share } from 'lucide-react';
import type { AddressContact } from '@/types/addressContact';
import { useAuth } from '@/contexts/auth';

interface ContactDetailModalProps {
  contact: AddressContact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: AddressContact) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (contactId: string, addressId: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSetPrimary,
}) => {
  const { isAdmin } = useAuth();

  if (!contact) return null;

  const handleShare = () => {
    // Create contact vCard data
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
${contact.title ? `TITLE:${contact.title}` : ''}
${contact.job_title ? `ORG:;${contact.job_title}` : ''}
${contact.telephone ? `TEL;TYPE=WORK:${contact.telephone}` : ''}
${contact.mobile ? `TEL;TYPE=CELL:${contact.mobile}` : ''}
${contact.email ? `EMAIL:${contact.email}` : ''}
${contact.general_notes ? `NOTE:${contact.general_notes}` : ''}
END:VCARD`;

    // Create and download vCard file
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>
              {contact.title && <span className="text-muted-foreground mr-1">{contact.title}</span>}
              {contact.name}
            </span>
            {contact.is_primary && (
              <Badge variant="default" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Primary</span>
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            {(contact.job_title || contact.department) && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <div className="text-sm">
                  {contact.job_title && <span>{contact.job_title}</span>}
                  {contact.job_title && contact.department && <span> • </span>}
                  {contact.department && <span>{contact.department}</span>}
                </div>
              </div>
            )}

            {contact.telephone && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {contact.telephone}
                    {contact.extension && <span className="text-muted-foreground"> ext. {contact.extension}</span>}
                  </span>
                </div>
              </div>
            )}

            {contact.mobile && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.mobile}</span>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              </div>
            )}

            {contact.general_notes && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <div className="text-sm p-3 bg-muted/50 rounded">
                  {contact.general_notes}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleShare} className="flex items-center space-x-2">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            
            {isAdmin && (
              <div className="flex space-x-2">
                {!contact.is_primary && (
                  <Button 
                    variant="outline" 
                    onClick={() => onSetPrimary(contact.id, contact.address_id)}
                    className="flex items-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Set Primary</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(contact)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onDelete(contact.id);
                    onClose();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};