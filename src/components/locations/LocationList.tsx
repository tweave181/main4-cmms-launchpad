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
import { MapPin, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useLocations } from '@/hooks/useLocations';
import { LocationForm } from './LocationForm';
import { LocationDetailModal } from './LocationDetailModal';
import type { Location, LocationFilters } from '@/types/location';

export const LocationList: React.FC = () => {
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const [filters, setFilters] = useState<LocationFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: locations = [], isLoading } = useLocations(filters);

  const handleCreateClick = () => {
    setEditingLocation(undefined);
    setIsFormOpen(true);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
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
                    <TableRow 
                      key={location.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleLocationClick(location)}
                    >
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

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          isOpen={!!selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
};