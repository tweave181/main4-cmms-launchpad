import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Database } from '@/integrations/supabase/types';
type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'] & {
  spare_parts_category?: {
    name: string;
  };
  supplier?: {
    company_name: string;
  };
};
interface InventoryPartTableProps {
  parts: InventoryPart[];
  onDeletePart: (partId: string) => void;
}
export const InventoryPartTable: React.FC<InventoryPartTableProps> = ({
  parts,
  onDeletePart
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { formatCurrency } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return {
      label: 'Out of Stock',
      variant: 'destructive' as const
    };
    if (quantity <= threshold) return {
      label: 'Low Stock',
      variant: 'secondary' as const
    };
    return {
      label: 'In Stock',
      variant: 'default' as const
    };
  };
  const handleRowClick = (partId: string) => {
    navigate(`/inventory/${partId}`);
  };
  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-300">Part Name</TableHead>
            <TableHead className="bg-gray-300">SKU</TableHead>
            <TableHead className="bg-gray-300">Type</TableHead>
            <TableHead className="bg-gray-300 text-center w-24">Stock Level</TableHead>
            <TableHead className="bg-gray-300 text-right">Unit Cost</TableHead>
            <TableHead className="bg-gray-300">Category</TableHead>
            <TableHead className="bg-gray-300">Supplier</TableHead>
            <TableHead className="bg-gray-300">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map(part => {
          const stockStatus = getStockStatus(part.quantity_in_stock, part.reorder_threshold);
          const inventoryTypeLabel = {
            spare_parts: 'Spare Parts',
            consumables: 'Consumables',
            tools: 'Tools',
            supplies: 'Supplies',
            materials: 'Materials'
          }[(part as any).inventory_type] || 'Spare Parts';
          
          return <TableRow key={part.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(part.id)}>
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell>{part.sku}</TableCell>
                <TableCell>{inventoryTypeLabel}</TableCell>
                <TableCell className="text-center w-24">{part.quantity_in_stock}</TableCell>
                <TableCell className="text-right font-mono">
                  {(part as any).unit_cost ? formatCurrency((part as any).unit_cost) : '-'}
                </TableCell>
                <TableCell>{part.spare_parts_category?.name || 'Uncategorized'}</TableCell>
                <TableCell>{part.supplier?.company_name || 'No Supplier'}</TableCell>
                <TableCell>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </TableCell>
              </TableRow>;
        })}
        </TableBody>
      </Table>
      {parts.length === 0 && <div className="text-center py-8 text-muted-foreground">
          No inventory parts found
        </div>}
    </div>;
};