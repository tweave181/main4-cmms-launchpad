
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Settings, Info, Loader2 } from 'lucide-react';
import { useUnlinkedCategories } from './hooks/useUnlinkedCategories';
import { useBulkPrefixSave } from './hooks/useBulkPrefixSave';
import { calculateNextNumber } from './hooks/useNextNumberCode';
import { BulkPrefixRow, BulkPrefixRowData } from './BulkPrefixRow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const DEFAULT_PREFIX_LETTER = 'E'; // Equipment

export const BulkPrefixEntry: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: unlinkedCategories, isLoading: categoriesLoading } = useUnlinkedCategories();
  const bulkSave = useBulkPrefixSave();
  
  const [rows, setRows] = useState<BulkPrefixRowData[]>([]);
  const [existingPrefixes, setExistingPrefixes] = useState<{ prefix_letter: string; number_code: string }[]>([]);

  // Load existing prefixes for duplicate checking
  useEffect(() => {
    const loadExistingPrefixes = async () => {
      if (!userProfile?.tenant_id) return;
      
      const { data } = await supabase
        .from('asset_tag_prefixes')
        .select('prefix_letter, number_code')
        .eq('tenant_id', userProfile.tenant_id);
      
      setExistingPrefixes(data || []);
    };
    
    loadExistingPrefixes();
  }, [userProfile?.tenant_id]);

  // Initialize rows when categories load
  useEffect(() => {
    if (unlinkedCategories && unlinkedCategories.length > 0 && rows.length === 0) {
      const initialRows: BulkPrefixRowData[] = [];
      const pendingAllocations: { prefix_letter: string; number_code: string }[] = [];

      unlinkedCategories.forEach((category, index) => {
        const nextNumber = calculateNextNumber(
          DEFAULT_PREFIX_LETTER,
          existingPrefixes,
          pendingAllocations
        );
        
        const newRow: BulkPrefixRowData = {
          id: `row-${index}`,
          category_id: category.id,
          category_name: category.name,
          prefix_letter: DEFAULT_PREFIX_LETTER,
          number_code: nextNumber.toString(),
          description: category.name,
        };
        
        initialRows.push(newRow);
        pendingAllocations.push({
          prefix_letter: DEFAULT_PREFIX_LETTER,
          number_code: nextNumber.toString(),
        });
      });

      setRows(initialRows);
    }
  }, [unlinkedCategories, existingPrefixes]);

  // Recalculate numbers when prefix letter changes
  const handleUpdate = (id: string, field: keyof BulkPrefixRowData, value: string) => {
    setRows(prev => {
      const updated = prev.map(row => {
        if (row.id !== id) return row;
        
        const updatedRow = { ...row, [field]: value };
        
        // If letter changed, auto-suggest new number
        if (field === 'prefix_letter' && value) {
          const pendingAllocations = prev
            .filter(r => r.id !== id && r.prefix_letter === value)
            .map(r => ({ prefix_letter: r.prefix_letter, number_code: r.number_code }));
          
          const nextNumber = calculateNextNumber(value, existingPrefixes, pendingAllocations);
          updatedRow.number_code = nextNumber.toString();
        }
        
        return updatedRow;
      });
      
      return updated;
    });
  };

  const handleRemove = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  // Check for duplicates
  const rowsWithDuplicates = useMemo(() => {
    const seen = new Map<string, string>();
    
    // Add existing prefixes to seen
    existingPrefixes.forEach(p => {
      const key = `${p.prefix_letter}-${parseInt(p.number_code)}`;
      seen.set(key, 'existing');
    });

    return rows.map(row => {
      if (!row.prefix_letter || !row.number_code) {
        return { ...row, isDuplicate: false };
      }
      
      const key = `${row.prefix_letter}-${parseInt(row.number_code)}`;
      const existingId = seen.get(key);
      
      if (existingId && existingId !== row.id) {
        return { ...row, isDuplicate: true };
      }
      
      seen.set(key, row.id);
      return { ...row, isDuplicate: false };
    });
  }, [rows, existingPrefixes]);

  const hasDuplicates = rowsWithDuplicates.some(r => r.isDuplicate);
  const hasInvalidRows = rowsWithDuplicates.some(r => !r.prefix_letter || !r.number_code);
  const canSave = rows.length > 0 && !hasDuplicates && !hasInvalidRows;

  const handleSave = async () => {
    if (!canSave) return;

    const prefixData = rows.map(row => ({
      category_id: row.category_id,
      prefix_letter: row.prefix_letter,
      number_code: row.number_code,
      description: row.description,
    }));

    await bulkSave.mutateAsync(prefixData);
    navigate('/admin/preferences/asset-prefixes');
  };

  if (categoriesLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unlinkedCategories || unlinkedCategories.length === 0) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-border">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">All Categories Have Prefixes</h3>
            <p className="text-muted-foreground mb-4">
              Every category already has an associated asset tag prefix configured.
            </p>
            <Button onClick={() => navigate('/admin/preferences/asset-prefixes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Prefix Manager
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-2xl shadow-sm border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              Bulk Asset Tag Prefix Setup
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/preferences/asset-prefixes')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!canSave || bulkSave.isPending}
              >
                {bulkSave.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save {rows.length} Prefix{rows.length !== 1 ? 'es' : ''}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{unlinkedCategories.length} categories</strong> found without asset tag prefixes. 
              Default prefix letter is <strong>"E"</strong> for Equipment. 
              Change the letter if you want different prefix groups.
            </AlertDescription>
          </Alert>

          {hasDuplicates && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Duplicate prefix combinations detected. Each letter + number combination must be unique.
              </AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground w-12">#</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground w-24">Letter</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground w-28">Number</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground w-28">Preview</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rowsWithDuplicates.map((row, index) => (
                  <BulkPrefixRow
                    key={row.id}
                    row={row}
                    index={index}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No rows to display. All categories have been removed.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
