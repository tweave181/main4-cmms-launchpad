import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Link as LinkIcon, Plus, Download, Trash2, ExternalLink } from 'lucide-react';
import {
  useContractDocuments,
  useDeleteContractDocument,
  getContractFileSignedUrl,
  ContractDocument,
} from '@/hooks/useContractDocuments';
import { AddContractDocumentDialog } from './AddContractDocumentDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

interface Props {
  contractId?: string;
  readOnly?: boolean;
}

const formatBytes = (n: number | null) => {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export const ContractDocumentsSection: React.FC<Props> = ({ contractId, readOnly }) => {
  const [addOpen, setAddOpen] = useState(false);
  const { data: docs = [], isLoading } = useContractDocuments(contractId);
  const del = useDeleteContractDocument(contractId || '');

  const openDoc = async (doc: ContractDocument) => {
    try {
      if (doc.document_type === 'link' && doc.external_url) {
        window.open(doc.external_url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (doc.file_path) {
        const url = await getContractFileSignedUrl(doc.file_path);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      toast({ title: 'Unable to open document', description: e.message, variant: 'destructive' });
    }
  };

  if (!contractId) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save the contract first to attach documents or links.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Documents & Links</CardTitle>
        {!readOnly && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents attached yet.</p>
        ) : (
          <ul className="divide-y">
            {docs.map((doc) => (
              <li key={doc.id} className="py-2 flex items-start gap-3">
                <div className="mt-1">
                  {doc.document_type === 'file' ? (
                    <FileText className="w-4 h-4 text-primary" />
                  ) : (
                    <LinkIcon className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{doc.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.document_type === 'file'
                      ? `${doc.file_name ?? ''}${doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}`
                      : doc.external_url}
                  </div>
                  {doc.description && (
                    <div className="text-xs text-muted-foreground mt-1">{doc.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openDoc(doc)} title="Open">
                    {doc.document_type === 'file' ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </Button>
                  {!readOnly && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove document?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{doc.title}" from this contract.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => del.mutate(doc)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {!readOnly && (
        <AddContractDocumentDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          contractId={contractId}
        />
      )}
    </Card>
  );
};
