import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, AlertTriangle, Archive } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];
interface AssetPrefixWithCount extends AssetTagPrefix {
  asset_count: number;
  is_at_capacity: boolean;
  is_archived?: boolean;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}
interface AssetPrefixListProps {
  prefixes: AssetPrefixWithCount[];
  onEditPrefix: (prefix: AssetPrefixWithCount) => void;
  onDeletePrefix: (id: string) => Promise<void>;
}
export const AssetPrefixList: React.FC<AssetPrefixListProps> = ({
  prefixes,
  onEditPrefix,
  onDeletePrefix
}) => {
  const handleEdit = (prefix: AssetPrefixWithCount) => {
    console.log('Edit button clicked for prefix:', prefix);
    try {
      onEditPrefix(prefix);
    } catch (error) {
      console.error('Error opening edit form:', error);
      toast({
        title: 'Error',
        description: 'Failed to open edit form. Please try again.',
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async (prefix: AssetPrefixWithCount) => {
    if (prefix.asset_count > 0) {
      toast({
        title: 'Cannot Delete Prefix',
        description: `This prefix is currently used by ${prefix.asset_count} asset(s). Please reassign or remove these assets first.`,
        variant: 'destructive'
      });
      return;
    }
    if (window.confirm(`Are you sure you want to delete the prefix "${prefix.prefix_letter}${parseInt(prefix.number_code)}"?`)) {
      try {
        await onDeletePrefix(prefix.id);
        toast({
          title: 'Success',
          description: 'Asset tag prefix deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting prefix:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete asset tag prefix. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };
  const getStatusIcon = (prefix: AssetPrefixWithCount) => {
    if (prefix.is_archived) {
      return <Archive className="h-4 w-4 text-gray-500" />;
    }
    if (prefix.is_at_capacity) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  const getStatusText = (prefix: AssetPrefixWithCount) => {
    if (prefix.is_archived) {
      return 'Archived';
    }
    if (prefix.is_at_capacity) {
      return 'At Capacity';
    }
    return 'Active';
  };
  const getRowClassName = (prefix: AssetPrefixWithCount) => {
    if (prefix.is_archived) {
      return 'bg-gray-50 text-gray-500';
    }
    if (prefix.is_at_capacity) {
      return 'bg-red-50';
    }
    return '';
  };
  if (prefixes.length === 0) {
    return <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No asset tag prefixes have been created yet. Click "Add Prefix" to create your first prefix.
        </AlertDescription>
      </Alert>;
  }
  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-300">Status</TableHead>
            <TableHead className="bg-gray-300">Prefix</TableHead>
            <TableHead className="bg-gray-300">Code</TableHead>
            <TableHead className="bg-gray-300">Category</TableHead>
            <TableHead className="bg-gray-300">Description</TableHead>
            <TableHead className="bg-gray-300">Assets Using</TableHead>
            <TableHead className="bg-gray-300">Capacity</TableHead>
            <TableHead className="bg-gray-300">Example Tag</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prefixes.map(prefix => <TableRow key={prefix.id} className={getRowClassName(prefix)}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(prefix)}
                  <span className="text-sm">{getStatusText(prefix)}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {prefix.prefix_letter}
              </TableCell>
              <TableCell>
                {parseInt(prefix.number_code)}
              </TableCell>
              <TableCell>
                {prefix.category ? <span className="font-medium">{prefix.category.name}</span> : <span className="text-muted-foreground">No category</span>}
              </TableCell>
              <TableCell>
                {prefix.category?.description || prefix.description || 'No description'}
              </TableCell>
              <TableCell>
                <span className={prefix.is_at_capacity ? 'text-red-600 font-semibold' : ''}>
                  {prefix.asset_count}
                </span>
              </TableCell>
              <TableCell>
                <span className={prefix.is_at_capacity ? 'text-red-600' : 'text-gray-600'}>
                  {prefix.asset_count}/999
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {prefix.prefix_letter}{parseInt(prefix.number_code)}/001
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(prefix)} disabled={prefix.is_archived} title={prefix.is_archived ? 'Cannot edit archived prefix' : 'Edit prefix'}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(prefix)} className="text-red-600 hover:text-red-700" disabled={prefix.asset_count > 0} title={prefix.asset_count > 0 ? 'Cannot delete prefix in use' : 'Delete prefix'}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
      
      {prefixes.some(p => p.is_at_capacity) && <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Some prefixes are at capacity (999 assets). Consider creating new prefixes for additional assets.
            </span>
          </div>
        </div>}
    </div>;
};