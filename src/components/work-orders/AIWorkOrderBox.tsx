import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type WorkType = 'corrective' | 'preventive' | 'emergency' | 'inspection';

interface DraftWorkOrder {
  title: string;
  description: string;
  priority: Priority;
  work_type: WorkType;
}

export const AIWorkOrderBox: React.FC = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<DraftWorkOrder | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-work-order', {
        body: { description: text.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDraft({
        title: data.title || '',
        description: data.description || '',
        priority: (data.priority as Priority) || 'medium',
        work_type: (data.work_type as WorkType) || 'corrective',
      });
    } catch (e: any) {
      toast({
        title: 'Generation failed',
        description: e.message || 'Could not generate work order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft || !userProfile?.tenant_id || !userProfile?.id) return;
    if (!draft.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from('work_orders').insert({
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        work_type: draft.work_type,
        status: 'open',
        tenant_id: userProfile.tenant_id,
        created_by: userProfile.id,
      } as any);

      if (insertError) throw insertError;

      toast({ title: 'Work order created', description: draft.title });
      setText('');
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    } catch (e: any) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save work order',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraft(null);
  };

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI-assisted Work Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!draft ? (
          <>
            <Textarea
              placeholder="Describe the task in plain language, e.g. 'The pump in bay 3 is leaking oil and needs urgent inspection.'"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              disabled={loading}
            />
            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={loading || !text.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate Preview
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Review and edit the generated work order before saving.
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-wo-title">Title</Label>
              <Input
                id="ai-wo-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-wo-desc">Description</Label>
              <Textarea
                id="ai-wo-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                disabled={saving}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select
                  value={draft.work_type}
                  onValueChange={(v) => setDraft({ ...draft, work_type: v as WorkType })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDiscard} disabled={saving}>
                <X className="h-4 w-4 mr-2" /> Discard
              </Button>
              <Button onClick={handleSave} disabled={saving || !draft.title.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Work Order
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
