import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSparePartsCategories, type SparePartsCategory } from '@/hooks/useSparePartsCategories';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
interface SparePartsCategoryListProps {
  categories: SparePartsCategory[];
  onEditCategory: (category: SparePartsCategory) => void;
  showInactive?: boolean;
}
export const SparePartsCategoryList: React.FC<SparePartsCategoryListProps> = ({
  categories,
  onEditCategory,
  showInactive = false
}) => {
  const {
    deleteCategory,
    updateCategory
  } = useSparePartsCategories();
  const [categoryToDelete, setCategoryToDelete] = React.useState<SparePartsCategory | null>(null);
  const filteredCategories = showInactive ? categories : categories.filter(cat => cat.is_active);
  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete.id);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };
  const handleToggleActive = async (category: SparePartsCategory) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        is_active: !category.is_active
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };
  if (filteredCategories.length === 0) {
    return <div className="text-center py-8">
        <p className="text-muted-foreground">
          {showInactive ? 'No categories found.' : 'No active categories found. Try showing inactive categories or create a new one.'}
        </p>
      </div>;
  }
  return <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="bg-slate-300">Description</TableHead>
            <TableHead className="bg-slate-300">Status</TableHead>
            <TableHead className="bg-slate-300">Created</TableHead>
            <TableHead className="w-[50px] bg-slate-300"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories.map(category => <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {category.description || 'No description'}
              </TableCell>
              <TableCell>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(category.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditCategory(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                      {category.is_active ? <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Deactivate
                        </> : <>
                          <Eye className="mr-2 h-4 w-4" />
                          Activate
                        </>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>

      <ConfirmationDialog isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} onConfirm={handleDeleteCategory} title="Delete Category" description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone and will fail if the category is currently in use.`} confirmText="Delete" cancelText="Cancel" />
    </>;
};