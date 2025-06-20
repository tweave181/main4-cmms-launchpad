
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

interface AssetPrefixListProps {
  prefixes: AssetTagPrefix[];
  onEditPrefix: (prefix: AssetTagPrefix) => void;
  onDeletePrefix: (id: string) => Promise<void>;
}

export const AssetPrefixList: React.FC<AssetPrefixListProps> = ({
  prefixes,
  onEditPrefix,
  onDeletePrefix,
}) => {
  const handleDelete = async (prefix: AssetTagPrefix) => {
    if (window.confirm(`Are you sure you want to delete the prefix "${prefix.prefix_letter}${parseInt(prefix.number_code)}"?`)) {
      await onDeletePrefix(prefix.id);
    }
  };

  if (prefixes.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No asset tag prefixes have been created yet. Click "Add Prefix" to create your first prefix.
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
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Example Tag</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prefixes.map((prefix) => (
            <TableRow key={prefix.id}>
              <TableCell className="font-medium">
                {prefix.prefix_letter}
              </TableCell>
              <TableCell>
                {parseInt(prefix.number_code)}
              </TableCell>
              <TableCell>
                {prefix.description}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {prefix.prefix_letter}{parseInt(prefix.number_code)}/001
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPrefix(prefix)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prefix)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
