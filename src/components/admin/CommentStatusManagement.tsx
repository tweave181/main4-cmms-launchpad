import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useCommentStatusOptions } from '@/hooks/useWorkOrderComments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface CommentStatusOption {
  id: string;
  status_name: string;
  status_color: string;
  sort_order: number;
  is_active: boolean;
}

export const CommentStatusManagement: React.FC = () => {
  const { data: statusOptions = [], refetch } = useCommentStatusOptions();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    status_name: '',
    status_color: '#3b82f6',
    sort_order: 1
  });

  const handleEdit = (option: CommentStatusOption) => {
    setEditingId(option.id);
    setFormData({
      status_name: option.status_name,
      status_color: option.status_color,
      sort_order: option.sort_order
    });
  };

  const handleSave = async (id?: string) => {
    try {
      if (id) {
        // Update existing
        const { error } = await supabase
          .from('comment_status_options')
          .update({
            status_name: formData.status_name,
            status_color: formData.status_color,
            sort_order: formData.sort_order
          })
          .eq('id', id);

        if (error) throw error;
        setEditingId(null);
      } else {
        // Create new
        const { error } = await supabase
          .from('comment_status_options')
          .insert({
            tenant_id: userProfile?.tenant_id,
            status_name: formData.status_name,
            status_color: formData.status_color,
            sort_order: formData.sort_order
          });

        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({ status_name: '', status_color: '#3b82f6', sort_order: 1 });
      refetch();
      toast({
        title: 'Success',
        description: `Comment status ${id ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      console.error('Error saving comment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to save comment status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comment_status_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
      toast({
        title: 'Success',
        description: 'Comment status deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment status',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ status_name: '', status_color: '#3b82f6', sort_order: 1 });
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Comment Status Management</CardTitle>
          <Button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Status
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAdding && (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="new-status-name">Status Name</Label>
                  <Input
                    id="new-status-name"
                    value={formData.status_name}
                    onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
                    placeholder="Enter status name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-status-color">Color</Label>
                  <Input
                    id="new-status-color"
                    type="color"
                    value={formData.status_color}
                    onChange={(e) => setFormData({ ...formData, status_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-sort-order">Sort Order</Label>
                  <Input
                    id="new-sort-order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => handleSave()}
                    disabled={!formData.status_name}
                    size="sm"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {statusOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
              {editingId === option.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    value={formData.status_name}
                    onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
                    placeholder="Status name"
                  />
                  <Input
                    type="color"
                    value={formData.status_color}
                    onChange={(e) => setFormData({ ...formData, status_color: e.target.value })}
                  />
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSave(option.id)}
                      disabled={!formData.status_name}
                      size="sm"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Badge 
                      style={{ backgroundColor: option.status_color }}
                      className="text-white"
                    >
                      {option.status_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Order: {option.sort_order}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(option)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(option.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {statusOptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No comment statuses configured. Click "Add Status" to create your first one.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};