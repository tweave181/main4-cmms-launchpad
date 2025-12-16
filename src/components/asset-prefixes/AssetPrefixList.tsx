import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Archive } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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
}

export const AssetPrefixList: React.FC<AssetPrefixListProps> = ({
  prefixes,
  onEditPrefix
}) => {
  const getStatusIcon = (prefix: AssetPrefixWithCount) => {
    if (prefix.is_archived) {
      return <Archive className="h-4 w-4 text-muted-foreground" />;
    }
    if (prefix.is_at_capacity) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
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
    const baseClasses = 'cursor-pointer hover:bg-muted/50 transition-colors';
    
    if (prefix.is_archived) {
      return 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60';
    }
    if (prefix.is_at_capacity) {
      return `bg-destructive/10 ${baseClasses}`;
    }
    return baseClasses;
  };

  const handleRowClick = (prefix: AssetPrefixWithCount) => {
    if (!prefix.is_archived) {
      onEditPrefix(prefix);
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
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted">Status</TableHead>
            <TableHead className="bg-muted">Prefix</TableHead>
            <TableHead className="bg-muted">Code</TableHead>
            <TableHead className="bg-muted">Category</TableHead>
            <TableHead className="bg-muted">Description</TableHead>
            <TableHead className="bg-muted">Assets Using</TableHead>
            <TableHead className="bg-muted">Capacity</TableHead>
            <TableHead className="bg-muted">Example Tag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prefixes.map(prefix => (
            <TableRow 
              key={prefix.id} 
              className={getRowClassName(prefix)}
              onClick={() => handleRowClick(prefix)}
            >
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
                {prefix.category ? (
                  <span className="font-medium">{prefix.category.name}</span>
                ) : (
                  <span className="text-muted-foreground">No category</span>
                )}
              </TableCell>
              <TableCell>
                {prefix.category?.description || prefix.description || 'No description'}
              </TableCell>
              <TableCell>
                <span className={prefix.is_at_capacity ? 'text-destructive font-semibold' : ''}>
                  {prefix.asset_count}
                </span>
              </TableCell>
              <TableCell>
                <span className={prefix.is_at_capacity ? 'text-destructive' : 'text-muted-foreground'}>
                  {prefix.asset_count}/999
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {prefix.prefix_letter}{parseInt(prefix.number_code)}/001
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {prefixes.some(p => p.is_at_capacity) && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Some prefixes are at capacity (999 assets). Consider creating new prefixes for additional assets.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
