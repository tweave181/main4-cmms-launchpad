import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocationLevels } from '@/hooks/useLocationLevels';
import { LocationLevelForm } from './LocationLevelForm';
import type { LocationLevel } from '@/types/location';
export const LocationLevelList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const {
    data: locationLevels = [],
    isLoading
  } = useLocationLevels({
    search: search || undefined
  });
  const handleRowClick = (level: LocationLevel) => {
    navigate(`/location-levels/${level.id}`);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  if (isLoading) {
    return <div>Loading location levels...</div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Location Levels</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Level
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search levels..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-slate-300">Name</TableHead>
              <TableHead className="bg-slate-300">Code</TableHead>
              <TableHead className="bg-slate-300">Status</TableHead>
              <TableHead className="bg-slate-300">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locationLevels.length === 0 ? <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No location levels found. Create one to get started.
                </TableCell>
              </TableRow> : locationLevels.map(level => <TableRow key={level.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(level)}>
                  <TableCell className="font-medium">{level.name}</TableCell>
                  <TableCell>
                    {level.code ? <code className="bg-muted px-2 py-1 rounded text-sm">
                        {level.code}
                      </code> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={level.is_active ? 'default' : 'secondary'}>
                      {level.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(level.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      <LocationLevelForm isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>;
};