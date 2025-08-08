import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

interface InventoryPartTableProps {
  parts: InventoryPart[];
  onDeletePart: (partId: string) => void;
}

export const InventoryPartTable: React.FC<InventoryPartTableProps> = ({
  parts,
  onDeletePart,
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleRowClick = (partId: string) => {
    navigate(`/inventory/${partId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => {
            const stockStatus = getStockStatus(part.quantity_in_stock, part.reorder_threshold);
            return (
              <TableRow
                key={part.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(part.id)}
              >
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell>{part.sku}</TableCell>
                <TableCell>{part.quantity_in_stock}</TableCell>
                <TableCell>{part.category || 'Uncategorized'}</TableCell>
                <TableCell>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {parts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No inventory parts found
        </div>
      )}
    </div>
  );
};