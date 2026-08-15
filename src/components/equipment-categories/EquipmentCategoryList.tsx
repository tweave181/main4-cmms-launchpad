import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { EquipmentCategory } from '@/hooks/useEquipmentCategories';

interface EquipmentCategoryListProps {
  categories: EquipmentCategory[];
  onEdit: (category: EquipmentCategory) => void;
  onToggleStatus: (category: EquipmentCategory) => void;
  canManage: boolean;
}

export const EquipmentCategoryList: React.FC<EquipmentCategoryListProps> = ({
  categories,
  onEdit,
  onToggleStatus,
  canManage,
}) => {
  if (categories.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No equipment categories yet. Click "Add Category" to create your first one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prefix</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assets</TableHead>
            <TableHead>Next Tag</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const atCapacity = category.next_sequence > category.max_sequence;
            return (
              <TableRow
                key={category.id}
                className={canManage ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                onClick={() => canManage && onEdit(category)}
              >
                <TableCell className="font-mono font-medium">{category.display_prefix}</TableCell>
                <TableCell className="font-medium">{category.category_name}</TableCell>
                <TableCell>
                  {category.description || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>{category.asset_count ?? 0}</TableCell>
                <TableCell className="font-mono text-sm">
                  {atCapacity
                    ? '—'
                    : `${category.display_prefix}/${String(category.next_sequence).padStart(3, '0')}`}
                </TableCell>
                <TableCell>
                  {atCapacity ? (
                    <Badge variant="destructive">At capacity</Badge>
                  ) : category.status === 'active' ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(category);
                      }}
                    >
                      {category.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
