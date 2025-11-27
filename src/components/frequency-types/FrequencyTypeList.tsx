import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteFrequencyType } from '@/hooks/useFrequencyTypes';
import type { FrequencyType } from '@/hooks/useFrequencyTypes';

interface FrequencyTypeListProps {
  frequencyTypes: FrequencyType[];
  onEdit: (type: FrequencyType) => void;
}

export const FrequencyTypeList: React.FC<FrequencyTypeListProps> = ({
  frequencyTypes,
  onEdit,
}) => {
  const deleteFrequencyType = useDeleteFrequencyType();

  const handleDelete = (id: string) => {
    deleteFrequencyType.mutate(id);
  };

  if (frequencyTypes.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          No frequency types found. Click "Add Frequency Type" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Sort Order</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {frequencyTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{type.description || '-'}</TableCell>
              <TableCell className="text-center">{type.sort_order}</TableCell>
              <TableCell className="text-center">
                <Badge variant={type.is_active ? 'default' : 'secondary'}>
                  {type.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Frequency Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{type.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(type.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
