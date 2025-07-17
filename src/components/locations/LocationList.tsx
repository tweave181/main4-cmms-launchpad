import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useLocations, useDeleteLocation } from '@/hooks/useLocations';
import { LocationForm } from './LocationForm';
import type { Location, LocationFilters } from '@/types/location';

export const LocationList: React.FC = () => {
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const [filters, setFilters] = useState<LocationFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();

  const { data: locations = [], isLoading } = useLocations(filters);
  const deleteLocation = useDeleteLocation();

  const handleCreateClick = () => {
    setEditingLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (location: Location) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (location: Location) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      await deleteLocation.mutateAsync(location.id);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value || undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Locations
            </CardTitle>
            {isAdmin && (
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search locations..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Locations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && <TableHead className="w-[70px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <MapPin className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No locations found</p>
                        {isAdmin && (
                          <Button variant="outline" onClick={handleCreateClick}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Location
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {location.location_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {location.description || '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(location.created_at)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(location)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(location)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <LocationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        location={editingLocation}
      />
    </div>
  );
};