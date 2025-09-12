import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Phone, Mail, MoreHorizontal, Edit, Trash2, Star } from 'lucide-react';
import type { AddressContact } from '@/types/addressContact';
import { useAuth } from '@/contexts/auth';

interface ContactCardProps {
  contact: AddressContact;
  onEdit: (contact: AddressContact) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (contactId: string, addressId: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onSetPrimary,
}) => {
  const { isAdmin } = useAuth();

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">
              {contact.title && <span className="text-muted-foreground mr-1">{contact.title}</span>}
              {contact.name}
            </h4>
            {contact.is_primary && (
              <Badge variant="default" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Primary</span>
              </Badge>
            )}
          </div>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!contact.is_primary && (
                  <DropdownMenuItem onClick={() => onSetPrimary(contact.id, contact.address_id)}>
                    <Star className="w-4 h-4 mr-2" />
                    Set as Primary
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(contact.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {(contact.job_title || contact.department) && (
          <div className="text-sm text-muted-foreground">
            {contact.job_title && <span>{contact.job_title}</span>}
            {contact.job_title && contact.department && <span> • </span>}
            {contact.department && <span>{contact.department}</span>}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {contact.telephone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>
                {contact.telephone}
                {contact.extension && <span className="text-muted-foreground"> ext. {contact.extension}</span>}
              </span>
            </div>
          )}
          
          {contact.mobile && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{contact.mobile}</span>
              <Badge variant="outline" className="text-xs px-1">Mobile</Badge>
            </div>
          )}
          
          {contact.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          
          {contact.general_notes && (
            <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
              {contact.general_notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};