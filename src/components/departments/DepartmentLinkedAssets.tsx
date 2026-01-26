import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface DepartmentLinkedAssetsProps {
  departmentId: string;
}

export const DepartmentLinkedAssets: React.FC<DepartmentLinkedAssetsProps> = ({ departmentId }) => {
  const navigate = useNavigate();

  const { data: linkedAssets = [] } = useQuery({
    queryKey: ['department-assets', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, asset_tag, name, status')
        .eq('department_id', departmentId)
        .order('asset_tag');
      if (error) throw error;
      return data || [];
    },
    enabled: !!departmentId,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'retired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Linked Assets ({linkedAssets.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedAssets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No assets are assigned to this department.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/assets?assetId=${asset.id}`)}
                >
                  <TableCell className="font-medium">{asset.asset_tag || '-'}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(asset.status)}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const useDepartmentLinkedAssets = (departmentId: string) => {
  return useQuery({
    queryKey: ['department-assets', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id')
        .eq('department_id', departmentId)
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!departmentId,
  });
};
