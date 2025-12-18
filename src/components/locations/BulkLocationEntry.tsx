import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import { BulkLocationRow, BulkLocationData } from './BulkLocationRow';
import { useAuth } from '@/contexts/auth';
import { useDepartments } from '@/hooks/useDepartments';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const generateId = () => crypto.randomUUID();

const createEmptyRow = (): BulkLocationData => ({
  id: generateId(),
  name: '',
  location_code: '',
  location_level_id: '',
  department_id: 'none',
  description: '',
});

export const BulkLocationEntry: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;
  const queryClient = useQueryClient();
  const { departments } = useDepartments();

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

      const savedLocations: string[] = [];

      for (const loc of locationsToSave) {
        const departmentId = loc.department_id === 'none' ? null : loc.department_id;

        const { data, error } = await supabase
          .from('locations')
          .insert({
            tenant_id: tenantId,
            name: loc.name.trim(),
            location_code: loc.location_code.trim(),
            location_level_id: loc.location_level_id || null,
            department_id: departmentId,
            description: loc.description.trim() || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        
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
                    <th className="p-2 text-left text-sm font-medium w-48">Department</th>
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
                      departments={departments}
                      onChange={handleChange}
                      onRemove={handleRemove}
                      errors={errors[row.id]}
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
