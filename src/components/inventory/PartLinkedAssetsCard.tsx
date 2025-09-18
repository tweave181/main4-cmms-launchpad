import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, ExternalLink } from 'lucide-react';
import { usePartLinkedAssets } from '@/hooks/queries/usePartLinkedAssets';
interface PartLinkedAssetsCardProps {
  partId: string;
}
export const PartLinkedAssetsCard: React.FC<PartLinkedAssetsCardProps> = ({
  partId
}) => {
  const {
    data: linkedAssets,
    isLoading
  } = usePartLinkedAssets(partId);
  const openAssetDetail = (assetId: string) => {
    window.open(`/assets?asset=${assetId}`, '_blank');
  };
  if (isLoading) {
    return <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Linked Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading linked assets...</div>
        </CardContent>
      </Card>;
  }
  return <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          Linked Assets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!linkedAssets || linkedAssets.length === 0 ? <div className="text-sm text-muted-foreground text-center py-4">
            This part isn't linked to any assets yet.
          </div> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-300">Asset</TableHead>
                <TableHead className="bg-gray-300">Tag</TableHead>
                <TableHead className="bg-gray-300">Location</TableHead>
                <TableHead className="bg-gray-300">Qty Required</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedAssets.map(asset => <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    {asset.asset_tag ? <Badge variant="outline">{asset.asset_tag}</Badge> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {asset.location || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.quantity_required}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openAssetDetail(asset.id)} className="p-1">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>}
      </CardContent>
    </Card>;
};