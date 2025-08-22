import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ExternalLink } from 'lucide-react';
import { useSupplierParts } from '@/hooks/queries/useSupplierParts';

interface SuppliedPartsCardProps {
  supplierId: string;
}

export const SuppliedPartsCard: React.FC<SuppliedPartsCardProps> = ({
  supplierId,
}) => {
  const { data: parts, isLoading } = useSupplierParts(supplierId);

  const openPartDetail = (partId: string) => {
    window.open(`/inventory/${partId}`, '_blank');
  };

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Supplied Parts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading supplied parts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          Supplied Parts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!parts || parts.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            This supplier doesn't have any parts assigned yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Threshold</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => {
                const stockStatus = getStockStatus(part.quantity_in_stock, part.reorder_threshold);
                return (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{part.sku}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{part.quantity_in_stock}</span>
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{part.reorder_threshold}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPartDetail(part.id)}
                        className="p-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};