import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Copy, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgramSettings } from '@/hooks/useProgramSettings';
import { buildContractFolderUrl } from '@/utils/networkFolderUtils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';

interface NetworkFolderCardProps {
  contractName: string;
}

export const NetworkFolderCard: React.FC<NetworkFolderCardProps> = ({ contractName }) => {
  const { data: settings } = useProgramSettings();
  const { isAdmin } = useAuth();
  const root = settings?.network_documents_root;
  const link = buildContractFolderUrl(root, contractName);

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.displayPath);
      toast({ title: 'Path copied' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Network Folder
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!link ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              No network documents root configured.{' '}
              {isAdmin && (
                <Link to="/settings" className="text-primary underline">
                  Set one up in System Settings
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Documents for this contract should be stored at:
            </p>
            <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
              {link.displayPath}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="default">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Folder
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Path
              </Button>
            </div>
            {!link.isWebUrl && (
              <p className="text-xs text-muted-foreground">
                Note: most browsers block opening network/file paths directly. If the link
                doesn't open, copy the path and paste it into Windows Explorer.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
