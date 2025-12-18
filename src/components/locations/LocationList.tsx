import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useLocations } from '@/hooks/useLocations';
import { useDepartments } from '@/hooks/useDepartments';
import { LocationForm } from './LocationForm';
import { LocationDetailModal } from './LocationDetailModal';
import type { Location, LocationFilters } from '@/types/location';
import { useLocationLevels } from '@/hooks/useLocationLevels';

export const LocationList: React.FC = () => {
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const [filters, setFilters] = useState<LocationFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: locations = [], isLoading } = useLocations(filters);
  const { data: locationLevels = [] } = useLocationLevels({ is_active: true });
  const { departments } = useDepartments();

  const handleCreateClick = () => {
    setEditingLocation(undefined);
    setIsFormOpen(true);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      department_id: value === 'all' ? undefined : value
    }));
  };

  const handleLocationLevelChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      location_level_id: value === 'all' ? undefined : value
    }));
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
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or code..."
                className="pl-10"
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
            
            <Select onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleLocationLevelChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {locationLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Locations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted/50">Location Name</TableHead>
                  <TableHead className="bg-muted/50">Code</TableHead>
                  <TableHead className="bg-muted/50">Level</TableHead>
                  <TableHead className="bg-muted/50 hidden sm:table-cell">Department</TableHead>
                  <TableHead className="bg-muted/50 hidden md:table-cell">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No locations found</p>
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
                  locations.map(location => (
                    <TableRow
                      key={location.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleLocationClick(location)}
                    >
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {location.location_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {location.location_level_data?.name || location.location_level || 'Building'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {location.department?.name || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
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
