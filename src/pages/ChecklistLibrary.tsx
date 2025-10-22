import React, { useState } from 'react';
import { Plus, Search, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { useDebounce } from '@/hooks/useDebounce';
import { AddChecklistTemplateModal } from '@/components/checklist-library/AddChecklistTemplateModal';
import { EditChecklistTemplateModal } from '@/components/checklist-library/EditChecklistTemplateModal';
import { TemplateUsageModal } from '@/components/checklist-library/TemplateUsageModal';
import { ChecklistTypeBadge } from '@/components/checklist-library/ChecklistTypeIcons';
import type { ChecklistItemType } from '@/types/checklistTemplate';

export default function ChecklistLibrary() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChecklistItemType | 'all'>('all');
  const [safetyCriticalFilter, setSafetyCriticalFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingUsageId, setViewingUsageId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch,
    item_type: typeFilter !== 'all' ? typeFilter : undefined,
    safety_critical: safetyCriticalFilter === 'yes' ? true : safetyCriticalFilter === 'no' ? false : undefined,
  };

  const { data: templates, isLoading } = useChecklistTemplates(filters);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checklist Library</h1>
            <p className="text-muted-foreground">
              Manage reusable checklist items for preventive maintenance schedules
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checklist items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="safety_note">Safety Note</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="to_do">To Do Something</SelectItem>
                  <SelectItem value="reading">Take a Reading</SelectItem>
                </SelectContent>
              </Select>
              <Select value={safetyCriticalFilter} onValueChange={(value) => setSafetyCriticalFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Safety critical" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="yes">Safety Critical Only</SelectItem>
                  <SelectItem value="no">Non-Critical Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading...</div>
            ) : templates && templates.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Image</TableHead>
                      <TableHead>Item Text</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[120px]">Safety</TableHead>
                      <TableHead className="w-[100px]">Used In</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          {template.image_url ? (
                            <img
                              src={template.image_url}
                              alt=""
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{template.item_text}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {template.description || '—'}
                        </TableCell>
                        <TableCell>
                          <ChecklistTypeBadge type={template.item_type} />
                        </TableCell>
                        <TableCell>
                          {template.safety_critical && (
                            <Badge variant="destructive" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Critical
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => setViewingUsageId(template.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(template.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No checklist items found</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddChecklistTemplateModal open={showAddModal} onOpenChange={setShowAddModal} />
      
      {editingId && (
        <EditChecklistTemplateModal
          templateId={editingId}
          open={true}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}

      {viewingUsageId && (
        <TemplateUsageModal
          templateId={viewingUsageId}
          open={true}
          onOpenChange={(open) => !open && setViewingUsageId(null)}
        />
      )}
    </AppLayout>
  );
}
