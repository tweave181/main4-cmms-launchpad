import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAddContractLink, useUploadContractFile } from '@/hooks/useContractDocuments';
import { toast } from '@/components/ui/use-toast';

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
}

export const AddContractDocumentDialog: React.FC<Props> = ({ open, onClose, contractId }) => {
  const [tab, setTab] = useState<'file' | 'link'>('file');

  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');

  const uploadFile = useUploadContractFile(contractId);
  const addLink = useAddContractLink(contractId);

  const reset = () => {
    setFileTitle(''); setFileDesc(''); setFile(null);
    setLinkTitle(''); setLinkUrl(''); setLinkDesc('');
  };

  const close = () => { reset(); onClose(); };

  const submitFile = async () => {
    if (!file) return toast({ title: 'Please choose a file', variant: 'destructive' });
    if (file.size > MAX_FILE_BYTES) return toast({ title: 'File too large (max 20 MB)', variant: 'destructive' });
    const title = fileTitle.trim() || file.name;
    await uploadFile.mutateAsync({ file, title, description: fileDesc.trim() || undefined });
    close();
  };

  const submitLink = async () => {
    const title = linkTitle.trim();
    const url = linkUrl.trim();
    if (!title) return toast({ title: 'Title is required', variant: 'destructive' });
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
    } catch {
      return toast({ title: 'Enter a valid http(s) URL', variant: 'destructive' });
    }
    await addLink.mutateAsync({ title, url, description: linkDesc.trim() || undefined });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Contract Document</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'file' | 'link')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="link">External Link</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="doc-file">File (max 20 MB)</Label>
              <Input
                id="doc-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-file-title">Title (optional, defaults to filename)</Label>
              <Input id="doc-file-title" value={fileTitle} maxLength={200}
                     onChange={(e) => setFileTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-file-desc">Description</Label>
              <Textarea id="doc-file-desc" value={fileDesc} maxLength={500}
                        onChange={(e) => setFileDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={submitFile} disabled={uploadFile.isPending}>
                {uploadFile.isPending ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="doc-link-title">Title</Label>
              <Input id="doc-link-title" value={linkTitle} maxLength={200}
                     onChange={(e) => setLinkTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-link-url">URL</Label>
              <Input id="doc-link-url" type="url" placeholder="https://…"
                     value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-link-desc">Description</Label>
              <Textarea id="doc-link-desc" value={linkDesc} maxLength={500}
                        onChange={(e) => setLinkDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={submitLink} disabled={addLink.isPending}>
                {addLink.isPending ? 'Saving…' : 'Add Link'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
