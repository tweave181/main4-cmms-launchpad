import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type SortConfig = {
  column: 'name' | 'asset_tag' | 'department';
  direction: 'asc' | 'desc';
} | null;

interface AssetTableProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onDuplicateAsset: (asset: Asset) => void;
  sortConfig: SortConfig;
  onSort: (column: 'name' | 'asset_tag' | 'department') => void;
}
export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onViewAsset,
  onEditAsset,
  onDeleteAsset,
  onDuplicateAsset,
  sortConfig,
  onSort
}) => {
  const {
    departments
  } = useDepartments();
  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return '-';
    const department = departments.find(d => d.id === departmentId);
    return department?.name || '-';
  };
  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      disposed: 'bg-red-100 text-red-800'
    };
    return <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>;
  };
  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>;
  };

  const getSortIcon = (column: 'name' | 'asset_tag' | 'department') => {
    if (!sortConfig || sortConfig.column !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getHeaderClass = (column: 'name' | 'asset_tag' | 'department') => {
    const baseClass = "cursor-pointer hover:bg-blue-50 transition-colors";
    const activeClass = sortConfig?.column === column ? "bg-blue-100" : "bg-gray-300";
    return `${baseClass} ${activeClass}`;
  };
  return <div className="rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className={getHeaderClass('name')}
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                Asset Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className={getHeaderClass('asset_tag')}
              onClick={() => onSort('asset_tag')}
            >
              <div className="flex items-center gap-2">
                Asset Tag
                {getSortIcon('asset_tag')}
              </div>
            </TableHead>
            <TableHead 
              className={getHeaderClass('department')}
              onClick={() => onSort('department')}
            >
              <div className="flex items-center gap-2">
                Department
                {getSortIcon('department')}
              </div>
            </TableHead>
            <TableHead className="bg-gray-300">Location</TableHead>
            <TableHead className="bg-gray-300">Status</TableHead>
            <TableHead className="bg-gray-300">Priority</TableHead>
            
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(asset => <TableRow key={asset.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewAsset(asset)}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.asset_tag || '-'}</TableCell>
              <TableCell>{getDepartmentName(asset.department_id)}</TableCell>
              <TableCell>
                {(asset as any).location ? <div className="flex items-center gap-2">
                    {(asset as any).location.location_code && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                        {(asset as any).location.location_code}
                      </span>}
                    <span>{(asset as any).location.name}</span>
                  </div> : '-'}
              </TableCell>
              <TableCell>{getStatusBadge(asset.status)}</TableCell>
              <TableCell>{getPriorityBadge(asset.priority)}</TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};