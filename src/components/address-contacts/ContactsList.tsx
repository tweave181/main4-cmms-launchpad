import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus } from 'lucide-react';
import { useAddressContacts, useDeleteAddressContact, useSetPrimaryContact } from '@/hooks/useAddressContacts';
import { useAuth } from '@/contexts/auth';
import { AddContactModal } from './AddContactModal';
import { ContactCard } from './ContactCard';
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
  const { isAdmin } = useAuth();
  const { data: contacts, isLoading, error } = useAddressContacts(addressId);
  const deleteMutation = useDeleteAddressContact();
  const setPrimaryMutation = useSetPrimaryContact();

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

  const handleSetPrimary = async (contactId: string, addressId: string) => {
    try {
      await setPrimaryMutation.mutateAsync({ contactId, addressId });
      toast({
        title: 'Success',
        description: 'Primary contact updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set primary contact.',
        variant: 'destructive',
      });
    }
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
        {isAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        )}
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={setDeleteConfirmId}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-2">No contacts found</div>
          {isAdmin && (
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          )}
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