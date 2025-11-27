import React, { useState } from 'react';
import { Plus, Search, Download, Grid, Table as TableIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { useDebounce } from '@/hooks/useDebounce';
import { AddChecklistTemplateModal } from '@/components/checklist-library/AddChecklistTemplateModal';
import { EditChecklistTemplateModal } from '@/components/checklist-library/EditChecklistTemplateModal';
import { TemplateUsageModal } from '@/components/checklist-library/TemplateUsageModal';
import { ChecklistTypeBadge } from '@/components/checklist-library/ChecklistTypeIcons';
import { ImageGalleryView } from '@/components/checklist-library/ImageGalleryView';
import { BulkActionsBar } from '@/components/checklist-library/BulkActionsBar';
import { ImageNameEditor } from '@/components/checklist-library/ImageNameEditor';
import { downloadSingleImage, downloadMultipleImagesAsZip, exportImageListAsCSV } from '@/utils/imageDownloadUtils';
import { toast } from 'sonner';
import type { ChecklistItemType } from '@/types/checklistTemplate';

export default function ChecklistLibrary() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChecklistItemType | 'all'>('all');
  const [safetyCriticalFilter, setSafetyCriticalFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingUsageId, setViewingUsageId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch,
    item_type: typeFilter !== 'all' ? typeFilter : undefined,
    safety_critical: safetyCriticalFilter === 'yes' ? true : safetyCriticalFilter === 'no' ? false : undefined,
  };

  const { data: templates, isLoading } = useChecklistTemplates(filters);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadZip = async () => {
    if (!templates) return;
    const selected = templates.filter(t => selectedIds.has(t.id) && t.image_url);
    if (selected.length === 0) {
      toast.error('No images selected');
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadMultipleImagesAsZip(
        selected.map(t => ({ url: t.image_url!, name: t.image_name || t.item_text }))
      );
      toast.success(`Downloaded ${selected.length} images`);
    } catch (error) {
      toast.error('Failed to create ZIP file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportCSV = () => {
    if (!templates) return;
    const selected = templates.filter(t => selectedIds.has(t.id));
    try {
      exportImageListAsCSV(selected);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checklist Lines Library</h1>
            <p className="text-muted-foreground">Manage reusable checklist line items</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checklist items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="safety_note">Safety Note</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
              <Select value={safetyCriticalFilter} onValueChange={(v) => setSafetyCriticalFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Safety Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="yes">Safety Critical</SelectItem>
                  <SelectItem value="no">Non-Critical</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <BulkActionsBar
                selectedCount={selectedIds.size}
                onDownloadZip={handleDownloadZip}
                onExportCSV={handleExportCSV}
                onClearSelection={() => setSelectedIds(new Set())}
                isDownloading={isDownloading}
              />
            )}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !templates || templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No checklist items found</div>
            ) : viewMode === 'grid' ? (
              <ImageGalleryView
                templates={templates}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={templates.every(t => selectedIds.has(t.id))}
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked ? new Set(templates.map(t => t.id)) : new Set());
                        }}
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Item Text</TableHead>
                    <TableHead>Image Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Safety</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(template.id)}
                          onCheckedChange={() => toggleSelect(template.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {template.image_url && (
                          <img src={template.image_url} alt="" className="h-12 w-12 object-cover rounded" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{template.item_text}</TableCell>
                      <TableCell>
                        {template.image_url ? (
                          <ImageNameEditor
                            templateId={template.id}
                            currentName={template.image_name || template.item_text}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell><ChecklistTypeBadge type={template.item_type} /></TableCell>
                      <TableCell>
                        {template.safety_critical && (
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">Critical</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {template.image_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await downloadSingleImage(template.image_url!, template.image_name || template.item_text);
                                  toast.success('Image downloaded');
                                } catch {
                                  toast.error('Download failed');
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(template.id)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => setViewingUsageId(template.id)}>Usage</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddChecklistTemplateModal open={showAddModal} onOpenChange={setShowAddModal} />
      {editingId && (
        <EditChecklistTemplateModal templateId={editingId} open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)} />
      )}
      {viewingUsageId && (
        <TemplateUsageModal templateId={viewingUsageId} open={!!viewingUsageId} onOpenChange={(open) => !open && setViewingUsageId(null)} />
      )}
    </AppLayout>
  );
}
