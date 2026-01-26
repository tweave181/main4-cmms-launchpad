import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';

interface DepartmentLinkedLocationsProps {
  departmentId: string;
}

interface LinkedLocation {
  id: string;
  name: string;
  location_code: string;
}

export const DepartmentLinkedLocations: React.FC<DepartmentLinkedLocationsProps> = ({ departmentId }) => {
  const navigate = useNavigate();

  const { data: linkedLocations = [] } = useQuery({
    queryKey: ['department-locations', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, location_code')
        .eq('department_id', departmentId)
        .order('name');
      if (error) throw error;
      return (data || []) as LinkedLocation[];
    },
    enabled: !!departmentId,
  });

  return (
    <Card className="rounded-2xl shadow-sm border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Linked Locations ({linkedLocations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedLocations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No locations are assigned to this department.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Name</TableHead>
                <TableHead>Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedLocations.map((location) => (
                <TableRow
                  key={location.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/preferences/locations?locationId=${location.id}`)}
                >
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.location_code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const useDepartmentLinkedLocations = (departmentId: string) => {
  return useQuery({
    queryKey: ['department-locations', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id')
        .eq('department_id', departmentId)
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!departmentId,
  });
};
