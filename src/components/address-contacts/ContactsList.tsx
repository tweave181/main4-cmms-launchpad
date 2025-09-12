import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MoreHorizontal, Phone, Mail, Plus, Edit, Trash2 } from 'lucide-react';
import { useAddressContacts, useDeleteAddressContact } from '@/hooks/useAddressContacts';
import { AddContactModal } from './AddContactModal';
import { useToast } from '@/hooks/use-toast';
import type { AddressContact } from '@/types/addressContact';

interface ContactsListProps {
  addressId: string;
}

export const ContactsList: React.FC<ContactsListProps> = ({ addressId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<AddressContact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { data: contacts, isLoading, error } = useAddressContacts(addressId);
  const deleteMutation = useDeleteAddressContact();

  const handleEdit = (contact: AddressContact) => {
    setEditingContact(contact);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Contact deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact.',
        variant: 'destructive',
      });
    }
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-destructive">Error loading contacts</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contacts</h3>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {contact.title && <span className="text-muted-foreground mr-1">{contact.title}</span>}
                        {contact.name}
                      </div>
                      {contact.general_notes && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                          {contact.general_notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{contact.job_title || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{contact.department || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {contact.telephone && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone className="w-3 h-3" />
                          <span>
                            {contact.telephone}
                            {contact.extension && <span className="text-muted-foreground"> ext. {contact.extension}</span>}
                          </span>
                        </div>
                      )}
                      {contact.mobile && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone className="w-3 h-3" />
                          <span>{contact.mobile}</span>
                          <Badge variant="outline" className="text-xs px-1">Mobile</Badge>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-xs">{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirmId(contact.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-2">No contacts found</div>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Contact
          </Button>
        </div>
      )}

      <AddContactModal
        isOpen={isAddModalOpen || !!editingContact}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingContact(null);
        }}
        addressId={addressId}
        contact={editingContact}
      />

      <ConfirmationDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};