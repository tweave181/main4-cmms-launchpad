import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Building2, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { CompanyForm } from './CompanyForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteCompany } from '@/hooks/useCompanies';
import { AddressDisplay } from '@/components/addresses/AddressDisplay';
import type { CompanyDetails } from '@/types/company';

interface CompanyDetailModalProps {
  company: CompanyDetails;
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  isOpen,
  onClose,
}) => {
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteCompany = useDeleteCompany();

  const isAdmin = userProfile?.role === 'admin';

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCompany.mutateAsync(company.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen && !isEditOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-muted-foreground mb-2">
                Company Details Record For: {company.company_name}
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                {company.company_name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Company
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Address Type Badges */}
            {company.company_address && (
              <div className="flex flex-wrap gap-2">
                {company.company_address.is_manufacturer && (
                  <Badge variant="secondary">Manufacturer</Badge>
                )}
                {company.company_address.is_supplier && (
                  <Badge variant="secondary">Supplier</Badge>
                )}
                {company.company_address.is_contractor && (
                  <Badge variant="secondary">Contractor</Badge>
                )}
                {company.company_address.is_contact && (
                  <Badge variant="secondary">Contact</Badge>
                )}
                {company.company_address.is_other && (
                  <Badge variant="secondary">Other</Badge>
                )}
              </div>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Company Name</p>
                  <p className="text-sm text-gray-600">{company.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Name</p>
                  <p className="text-sm text-gray-600">{company.contact_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">
                    {company.email ? (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{company.email}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">
                    {company.phone ? (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {company.company_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressDisplay address={company.company_address} />
                </CardContent>
              </Card>
            )}


            {/* Record Information */}
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
                <span>Record Information</span>
                <span>Created At: {formatDate(company.created_at)}</span>
                <span>Last Updated: {formatDate(company.updated_at)}</span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CompanyForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        company={company}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{company.company_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};