import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocationLevels, useDeleteLocationLevel } from '@/hooks/useLocationLevels';
import { LocationLevelForm } from './LocationLevelForm';
import type { LocationLevel } from '@/types/location';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export const LocationLevelList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LocationLevel | undefined>();
  const [deletingLevel, setDeletingLevel] = useState<LocationLevel | null>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const deleteLocationLevel = useDeleteLocationLevel();
  const {
    data: locationLevels = [],
    isLoading
  } = useLocationLevels({
    search: search || undefined,
    includeUsage: true
  });
  const handleRowClick = (level: LocationLevel) => {
    // Don't navigate if clicking on action buttons
    if (level.usage_count && level.usage_count > 0) {
      navigate(`/admin/preferences/locations?levelId=${level.id}`);
    }
  };
  const handleEditClick = (e: React.MouseEvent, level: LocationLevel) => {
    e.stopPropagation();
    setEditingLevel(level);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (e: React.MouseEvent, level: LocationLevel) => {
    e.stopPropagation();
    setDeletingLevel(level);
  };
  const handleUsageClick = (e: React.MouseEvent, level: LocationLevel) => {
    e.stopPropagation();
    if (level.usage_count && level.usage_count > 0) {
      navigate(`/admin/preferences/locations?levelId=${level.id}`);
    }
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLevel(undefined);
  };
  const handleConfirmDelete = async () => {
    if (deletingLevel) {
      await deleteLocationLevel.mutateAsync(deletingLevel.id);
      setDeletingLevel(null);
    }
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
              <TableHead className="bg-slate-300">Usage</TableHead>
              <TableHead className="bg-slate-300">Created</TableHead>
              <TableHead className="bg-muted/50 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locationLevels.length === 0 ? <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                    {level.usage_count !== undefined && level.usage_count > 0 ? <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={e => handleUsageClick(e, level)}>
                        {level.usage_count}
                      </Badge> : <span className="text-muted-foreground">0</span>}
                  </TableCell>
                  <TableCell>
                    {new Date(level.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => handleEditClick(e, level)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={level.usage_count !== undefined && level.usage_count > 0} onClick={e => handleDeleteClick(e, level)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {level.usage_count !== undefined && level.usage_count > 0 ? `In use by ${level.usage_count} locations. Deactivate instead.` : 'Delete level'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      <LocationLevelForm isOpen={isFormOpen} onClose={handleCloseForm} locationLevel={editingLevel} />

      <AlertDialog open={!!deletingLevel} onOpenChange={() => setDeletingLevel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingLevel?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};