import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { AssetLevelBadge } from './AssetLevelBadge';
import { buildAssetTree } from '@/utils/assetHierarchyUtils';
import type { Asset } from './types';

interface AssetTreeViewProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
}

export const AssetTreeView: React.FC<AssetTreeViewProps> = ({ assets, onViewAsset }) => {
  const { departments } = useDepartments();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const tree = buildAssetTree(assets);

  const toggleNode = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

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

  const renderAssetRow = (asset: Asset, depth: number = 0): React.ReactNode[] => {
    const hasChildren = asset.children && asset.children.length > 0;
    const isExpanded = expandedNodes.has(asset.id);
    const rows: React.ReactNode[] = [];

    rows.push(
      <TableRow 
        key={asset.id} 
        className="cursor-pointer hover:bg-muted/50" 
        onClick={() => onViewAsset(asset)}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren && (
              <button 
                onClick={(e) => toggleNode(asset.id, e)}
                className="p-1 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <AssetLevelBadge assetType={asset.asset_type} showIcon={true} className="shrink-0" />
            <span>{asset.name}</span>
          </div>
        </TableCell>
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
          ) : '-'}
        </TableCell>
        <TableCell>{getStatusBadge(asset.status)}</TableCell>
      </TableRow>
    );

    if (hasChildren && isExpanded) {
      asset.children!.forEach(child => {
        rows.push(...renderAssetRow(child, depth + 1));
      });
    }

    return rows;
  };

  return (
    <div className="rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted">Asset Name</TableHead>
            <TableHead className="bg-muted">Asset Tag</TableHead>
            <TableHead className="bg-muted">Department</TableHead>
            <TableHead className="bg-muted">Location</TableHead>
            <TableHead className="bg-muted">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tree.map(asset => renderAssetRow(asset))}
        </TableBody>
      </Table>
    </div>
  );
};
