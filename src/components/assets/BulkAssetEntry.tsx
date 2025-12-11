import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Save, Lightbulb } from 'lucide-react';
import { BulkAssetRow, BulkAssetData } from './BulkAssetRow';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const generateId = () => crypto.randomUUID();

const createEmptyRow = (): BulkAssetData => ({
  id: generateId(),
  name: '',
  asset_tag: '',
  category_id: '',
  location_id: '',
  status: 'Active',
  priority: 'Medium',
  description: '',
});

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

  const handleChange = useCallback((id: string, field: keyof BulkAssetData, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: false }
    }));
  }, []);

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
        asset_tag: asset.asset_tag.trim() || null,
        category: categories.find(c => c.id === asset.category_id)?.name || null,
        location_id: asset.location_id || null,
        status: asset.status as 'Active' | 'Inactive' | 'Under Maintenance' | 'Decommissioned',
        priority: asset.priority as 'Low' | 'Medium' | 'High' | 'Critical',
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
      toast.error('Please fill in all required fields (Name)');
      return;
    }

    saveMutation.mutate(filledRows);
  };

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

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Asset Details</CardTitle>
            <CardDescription>
              Enter your assets below. Name is the only required field.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-2 text-left text-sm font-medium text-muted-foreground w-10">#</th>
                    <th className="p-2 text-left text-sm font-medium">Name *</th>
                    <th className="p-2 text-left text-sm font-medium w-28">Tag</th>
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
                      onChange={handleChange}
                      onRemove={handleRemove}
                      errors={errors[row.id]}
                      isLoadingLocations={isLoadingLocations}
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
                <strong>Tip:</strong> Create locations first, then you can assign assets to them. 
                Category and Location help organize your assets for easier management.
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
            disabled={filledRows.length === 0 || saveMutation.isPending}
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
