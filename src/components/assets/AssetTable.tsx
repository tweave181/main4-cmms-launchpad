
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetTableProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onViewAsset,
  onEditAsset,
  onDeleteAsset,
}) => {
  const { departments } = useDepartments();

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
      disposed: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow 
              key={asset.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewAsset(asset)}
            >
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.asset_tag || '-'}</TableCell>
              <TableCell>{getDepartmentName(asset.department_id)}</TableCell>
              <TableCell>
                {(asset as any).location ? (
                  <div className="flex items-center gap-2">
                    {(asset as any).location.location_code && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                        {(asset as any).location.location_code}
                      </span>
                    )}
                    <span>{(asset as any).location.name}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{getStatusBadge(asset.status)}</TableCell>
              <TableCell>{getPriorityBadge(asset.priority)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewAsset(asset)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditAsset(asset)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteAsset(asset.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
