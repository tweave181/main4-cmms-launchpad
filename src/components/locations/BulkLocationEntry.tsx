import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Save, Lightbulb } from 'lucide-react';
import { BulkLocationRow, BulkLocationData } from './BulkLocationRow';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const generateId = () => crypto.randomUUID();

const createEmptyRow = (): BulkLocationData => ({
  id: generateId(),
  name: '',
  location_code: '',
  location_level_id: '',
  parent_location_id: 'none',
  description: '',
});

export const BulkLocationEntry: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<BulkLocationData[]>(() => 
    Array.from({ length: 5 }, createEmptyRow)
  );
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof BulkLocationData, boolean>>>>({});

  // Fetch location levels
  const { data: locationLevels = [] } = useQuery({
    queryKey: ['location-levels', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('location_levels')
        .select('id, name, code')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch existing locations for parent dropdown
  const { data: existingLocations = [], isLoading: isLoadingLocations } = useQuery({
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
    staleTime: 0, // Always refetch to get latest data
  });

  const handleChange = useCallback((id: string, field: keyof BulkLocationData, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
    // Clear error for this field
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
  const filledRows = rows.filter(row => row.name.trim() !== '' || row.location_code.trim() !== '');

  const validateRows = () => {
    const newErrors: Record<string, Partial<Record<keyof BulkLocationData, boolean>>> = {};
    let isValid = true;

    filledRows.forEach(row => {
      const rowErrors: Partial<Record<keyof BulkLocationData, boolean>> = {};
      
      if (!row.name.trim()) {
        rowErrors.name = true;
        isValid = false;
      }
      if (!row.location_code.trim()) {
        rowErrors.location_code = true;
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
    mutationFn: async (locationsToSave: BulkLocationData[]) => {
      if (!tenantId) throw new Error('No tenant ID');

      // Create a map to track temporary IDs to real IDs for parent references
      const idMap = new Map<string, string>();
      const savedLocations: string[] = [];

      // Sort locations: those without parents first, then those with parents
      const sortedLocations = [...locationsToSave].sort((a, b) => {
        const aHasNewParent = locationsToSave.some(loc => loc.id === a.parent_location_id);
        const bHasNewParent = locationsToSave.some(loc => loc.id === b.parent_location_id);
        if (aHasNewParent && !bHasNewParent) return 1;
        if (!aHasNewParent && bHasNewParent) return -1;
        return 0;
      });

      for (const loc of sortedLocations) {
        let parentId: string | null = null;
        
        if (loc.parent_location_id && loc.parent_location_id !== 'none') {
          // Check if parent is a new location we just created
          if (idMap.has(loc.parent_location_id)) {
            parentId = idMap.get(loc.parent_location_id)!;
          } else {
            parentId = loc.parent_location_id;
          }
        }

        const { data, error } = await supabase
          .from('locations')
          .insert({
            tenant_id: tenantId,
            name: loc.name.trim(),
            location_code: loc.location_code.trim(),
            location_level_id: loc.location_level_id || null,
            parent_location_id: parentId,
            description: loc.description.trim() || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        
        idMap.set(loc.id, data.id);
        savedLocations.push(data.id);
      }

      return savedLocations;
    },
    onSuccess: (savedIds) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success(`Successfully created ${savedIds.length} location${savedIds.length > 1 ? 's' : ''}`);
      navigate('/setup');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save locations: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (filledRows.length === 0) {
      toast.error('Please enter at least one location');
      return;
    }

    if (!validateRows()) {
      toast.error('Please fill in all required fields (Name and Code)');
      return;
    }

    saveMutation.mutate(filledRows);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/setup')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bulk Location Entry</h1>
            <p className="text-muted-foreground">Add multiple locations at once</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Location Details</CardTitle>
            <CardDescription>
              Enter your locations below. Name and Code are required fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-2 text-left text-sm font-medium text-muted-foreground w-10">#</th>
                    <th className="p-2 text-left text-sm font-medium">Name *</th>
                    <th className="p-2 text-left text-sm font-medium w-32">Code *</th>
                    <th className="p-2 text-left text-sm font-medium w-40">Level</th>
                    <th className="p-2 text-left text-sm font-medium w-48">Parent Location</th>
                    <th className="p-2 text-left text-sm font-medium">Description</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <BulkLocationRow
                      key={row.id}
                      index={index}
                      data={row}
                      locationLevels={locationLevels}
                      existingLocations={existingLocations}
                      newLocations={rows}
                      onChange={handleChange}
                      onRemove={handleRemove}
                      errors={errors[row.id]}
                      isLoadingParents={isLoadingLocations}
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
                <strong>Tip:</strong> Enter parent locations first (like Buildings), then child locations (like Floors and Rooms). 
                The parent dropdown updates as you add records.
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
              : `Save ${filledRows.length} Location${filledRows.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};
