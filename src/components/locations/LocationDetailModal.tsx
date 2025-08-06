import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { LocationForm } from './LocationForm';
import { useState } from 'react';
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
import { useDeleteLocation } from '@/hooks/useLocations';
import type { Location } from '@/types/location';

interface LocationDetailModalProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  isOpen,
  onClose,
}) => {
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteLocation = useDeleteLocation();

  const isAdmin = userProfile?.role === 'admin';

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteLocation.mutateAsync(location.id);
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
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                {location.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Location
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
            {/* Location Code Badge */}
            <div>
              <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                {location.location_code}
              </Badge>
            </div>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-gray-600">{location.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location Code</p>
                  <p className="text-sm text-gray-600 font-mono">{location.location_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location Level</p>
                  <p className="text-sm text-gray-600">{location.location_level || 'Building'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Parent Location</p>
                  <p className="text-sm text-gray-600">
                    {location.parent_location?.name || 'None (Top Level)'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-gray-600">
                    {location.description || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Activity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(location.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(location.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Record Information */}
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
                <span>Record Information</span>
                <span>Created At: {formatDate(location.created_at)}</span>
                <span>Last Updated: {formatDate(location.updated_at)}</span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LocationForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        location={location}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{location.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLocation.isPending}
            >
              {deleteLocation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};