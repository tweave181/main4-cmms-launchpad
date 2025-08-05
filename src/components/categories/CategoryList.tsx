
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onCategoryClick: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEditCategory,
  onCategoryClick,
}) => {

  if (categories.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No categories have been created yet. Click "Add Category" to create your first category.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onCategoryClick(category)}>
              <TableCell className="font-medium">
                {category.name}
              </TableCell>
              <TableCell>
                {category.description || (
                  <span className="text-muted-foreground">No description</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(category.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
