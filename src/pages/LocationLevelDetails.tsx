import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useLocationLevels, useDeleteLocationLevel } from '@/hooks/useLocationLevels';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LocationLevelForm } from '@/components/location-levels/LocationLevelForm';

const LocationLevelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingLevel, setDeletingLevel] = useState(false);

  const { data: locationLevels = [] } = useLocationLevels();
  const deleteLocationLevel = useDeleteLocationLevel();

  const locationLevel = locationLevels.find(level => level.id === id);

  // Fetch linked locations
  const { data: linkedLocations = [] } = useQuery({
    queryKey: ['locations-by-level', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, location_code, parent_location:locations!parent_location_id(name)')
        .eq('location_level_id', id)
        .order('name');

      if (error) {
        console.error('Error fetching linked locations:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!id,
  });

  const isInUse = linkedLocations.length > 0;

  const handleDelete = async () => {
    if (locationLevel && !isInUse) {
      await deleteLocationLevel.mutateAsync(locationLevel.id);
      navigate('/admin/preferences/location-levels');
    }
    setDeletingLevel(false);
  };

  if (!locationLevel) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/preferences/location-levels')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Location Levels
          </Button>
        </div>
        <div className="text-center text-muted-foreground">
          Location level not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin/preferences/location-levels')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Location Levels
          </Button>
          <h1 className="text-2xl font-bold">{locationLevel.name}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => setIsEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeletingLevel(true)}
                      disabled={isInUse}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TooltipTrigger>
                {isInUse && (
                  <TooltipContent>
                    This Location Level is in use and cannot be deleted.
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Level Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-lg">{locationLevel.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Code</label>
            <p className="text-lg">
              {locationLevel.code ? (
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {locationLevel.code}
                </code>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge variant={locationLevel.is_active ? 'default' : 'secondary'}>
                {locationLevel.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-lg">{new Date(locationLevel.created_at).toLocaleDateString()}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-lg">{new Date(locationLevel.updated_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Linked Locations ({linkedLocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedLocations.length === 0 ? (
            <p className="text-muted-foreground">No locations are using this level.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-slate-300">Location Name</TableHead>
                    <TableHead className="bg-slate-300">Code</TableHead>
                    <TableHead className="bg-slate-300">Parent Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedLocations.map((location: any) => (
                    <TableRow 
                      key={location.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/preferences/locations?locationId=${location.id}`)}
                    >
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{location.location_code}</Badge>
                      </TableCell>
                      <TableCell>{location.parent_location?.name || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LocationLevelForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        locationLevel={locationLevel}
      />

      <AlertDialog open={deletingLevel} onOpenChange={setDeletingLevel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{locationLevel.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LocationLevelDetails;
