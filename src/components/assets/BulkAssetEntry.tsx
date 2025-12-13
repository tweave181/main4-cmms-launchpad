import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Save, Lightbulb, AlertCircle, Tag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BulkAssetRow, BulkAssetData } from './BulkAssetRow';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const generateId = () => crypto.randomUUID();

const createEmptyRow = (): BulkAssetData => ({
  id: generateId(),
  name: '',
  prefix_id: '',
  asset_tag: '',
  category_id: '',
  location_id: '',
  status: 'active',
  priority: 'medium',
  description: '',
});

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
  category_id: string | null;
}

export const BulkAssetEntry: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<BulkAssetData[]>(() => 
    Array.from({ length: 5 }, createEmptyRow)
  );
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof BulkAssetData, boolean>>>>({});

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, location_code')
        .eq('tenant_id', tenantId)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
    staleTime: 0,
  });

  // Fetch asset tag prefixes
  const { data: prefixes = [], isLoading: isLoadingPrefixes } = useQuery({
    queryKey: ['asset-tag-prefixes', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .select('id, prefix_letter, number_code, description, category_id')
        .eq('tenant_id', tenantId)
        .order('prefix_letter')
        .order('number_code');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch existing assets to determine next sequence numbers
  const { data: existingAssets = [] } = useQuery({
    queryKey: ['existing-asset-tags', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('asset_tag')
        .eq('tenant_id', tenantId)
        .not('asset_tag', 'is', null);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Calculate the next sequence number for a prefix
  const getNextSequence = useCallback((prefixId: string, currentRows: BulkAssetData[]): string => {
    const prefix = prefixes.find(p => p.id === prefixId);
    if (!prefix) return '';

    // Format: E1/ (no leading zeros on prefix number)
    const prefixNumber = parseInt(prefix.number_code, 10).toString();
    const prefixTag = `${prefix.prefix_letter}${prefixNumber}/`;
    
    // Get sequences from existing assets in DB (check both old format E001/ and new format E1/)
    const dbSequences = existingAssets
      .map(a => a.asset_tag)
      .filter((tag): tag is string => {
        if (!tag) return false;
        // Match both E1/ and E001/ format
        const oldFormat = `${prefix.prefix_letter}${prefix.number_code}/`;
        return tag.startsWith(prefixTag) || tag.startsWith(oldFormat);
      })
      .map(tag => parseInt(tag.split('/')[1], 10))
      .filter(n => !isNaN(n));

    // Get sequences already used in current rows
    const rowSequences = currentRows
      .filter(r => r.prefix_id === prefixId && r.asset_tag)
      .map(r => parseInt(r.asset_tag.split('/')[1], 10))
      .filter(n => !isNaN(n));

    const allUsed = new Set([...dbSequences, ...rowSequences]);
    
    // Find next available sequence (1-999)
    for (let i = 1; i <= 999; i++) {
      if (!allUsed.has(i)) {
        return `${prefixTag}${i.toString().padStart(3, '0')}`;
      }
    }
    return '';
  }, [prefixes, existingAssets]);

  const handleChange = useCallback((id: string, field: keyof BulkAssetData, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: false }
    }));
  }, []);

  const handlePrefixChange = useCallback((id: string, prefixId: string) => {
    setRows(prev => {
      const newRows = prev.map(row => {
        if (row.id === id) {
          // Calculate the next sequence, considering other rows' tags
          const otherRows = prev.filter(r => r.id !== id);
          const asset_tag = getNextSequence(prefixId, otherRows);
          // Auto-set category from prefix
          const prefix = prefixes.find(p => p.id === prefixId);
          const category_id = prefix?.category_id || '';
          return { ...row, prefix_id: prefixId, asset_tag, category_id };
        }
        return row;
      });
      return newRows;
    });
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], asset_tag: false }
    }));
  }, [getNextSequence, prefixes]);

  const handleRemove = useCallback((id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const addMultipleRows = useCallback((count: number) => {
    setRows(prev => [...prev, ...Array.from({ length: count }, createEmptyRow)]);
  }, []);

  // Get rows that have data entered
  const filledRows = rows.filter(row => row.name.trim() !== '');

  const validateRows = () => {
    const newErrors: Record<string, Partial<Record<keyof BulkAssetData, boolean>>> = {};
    let isValid = true;

    filledRows.forEach(row => {
      const rowErrors: Partial<Record<keyof BulkAssetData, boolean>> = {};
      
      if (!row.name.trim()) {
        rowErrors.name = true;
        isValid = false;
      }

      if (!row.asset_tag) {
        rowErrors.asset_tag = true;
        isValid = false;
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[row.id] = rowErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const saveMutation = useMutation({
    mutationFn: async (assetsToSave: BulkAssetData[]) => {
      if (!tenantId) throw new Error('No tenant ID');

      const assetsData = assetsToSave.map(asset => ({
        tenant_id: tenantId,
        name: asset.name.trim(),
        asset_tag: asset.asset_tag,
        category: categories.find(c => c.id === asset.category_id)?.name || null,
        location_id: asset.location_id || null,
        status: asset.status as 'active' | 'inactive' | 'maintenance' | 'disposed',
        priority: asset.priority as 'low' | 'medium' | 'high' | 'critical',
        description: asset.description.trim() || null,
      }));

      const { data, error } = await supabase
        .from('assets')
        .insert(assetsData)
        .select('id');

      if (error) throw error;
      return data;
    },
    onSuccess: (savedAssets) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-setup-status'] });
      queryClient.invalidateQueries({ queryKey: ['existing-asset-tags'] });
      toast.success(`Successfully created ${savedAssets.length} asset${savedAssets.length > 1 ? 's' : ''}`);
      navigate('/setup');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save assets: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (filledRows.length === 0) {
      toast.error('Please enter at least one asset');
      return;
    }

    if (!validateRows()) {
      toast.error('Please fill in all required fields (Name and Tag)');
      return;
    }

    saveMutation.mutate(filledRows);
  };

  const noPrefixesConfigured = prefixes.length === 0 && !isLoadingPrefixes;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/setup')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bulk Asset Entry</h1>
            <p className="text-muted-foreground">Add multiple assets at once</p>
          </div>
        </div>

        {noPrefixesConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No asset tag prefixes configured. Please{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-destructive underline"
                onClick={() => navigate('/admin/preferences/asset-prefixes/bulk')}
              >
                configure prefixes first
              </Button>{' '}
              before creating assets.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Asset Details</CardTitle>
            <CardDescription>
              Enter your assets below. Name and Tag are required fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-2 text-left text-sm font-medium text-muted-foreground w-10">#</th>
                    <th className="p-2 text-left text-sm font-medium">Name *</th>
                    <th className="p-2 text-center text-sm font-medium w-12">Prefix</th>
                    <th className="p-2 text-left text-sm font-medium w-20">Tag</th>
                    <th className="p-2 text-left text-sm font-medium w-36">Category</th>
                    <th className="p-2 text-left text-sm font-medium w-40">Location</th>
                    <th className="p-2 text-left text-sm font-medium w-32">Status</th>
                    <th className="p-2 text-left text-sm font-medium w-28">Priority</th>
                    <th className="p-2 text-left text-sm font-medium">Description</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <BulkAssetRow
                      key={row.id}
                      index={index}
                      data={row}
                      categories={categories}
                      locations={locations}
                      prefixes={prefixes}
                      onChange={handleChange}
                      onPrefixChange={handlePrefixChange}
                      onRemove={handleRemove}
                      errors={errors[row.id]}
                      isLoadingLocations={isLoadingLocations}
                      isLoadingPrefixes={isLoadingPrefixes}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button variant="outline" size="sm" onClick={() => addMultipleRows(5)}>
                <Plus className="h-4 w-4 mr-1" />
                Add 5 Rows
              </Button>
            </div>

            <div className="flex items-start gap-2 mt-6 p-3 bg-muted/50 rounded-lg">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Select a prefix to auto-generate a unique asset tag. 
                Each prefix can have up to 999 assets.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/setup')}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={filledRows.length === 0 || saveMutation.isPending || noPrefixesConfigured}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending 
              ? 'Saving...' 
              : `Save ${filledRows.length} Asset${filledRows.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};
