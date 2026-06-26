import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export const AIWorkOrderBox: React.FC = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim() || !userProfile?.tenant_id || !userProfile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-work-order', {
        body: { description: text.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { error: insertError } = await supabase.from('work_orders').insert({
        title: data.title,
        description: data.description,
        priority: data.priority,
        work_type: data.work_type,
        status: 'open',
        tenant_id: userProfile.tenant_id,
        created_by: userProfile.id,
      } as any);

      if (insertError) throw insertError;

      toast({ title: 'Work order created', description: data.title });
      setText('');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    } catch (e: any) {
      toast({
        title: 'Generation failed',
        description: e.message || 'Could not create work order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
                <Sparkles className="h-4 w-4 mr-2" /> Generate & Save
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
