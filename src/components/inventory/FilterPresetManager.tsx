import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Bookmark, Trash2, Edit2, Star, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface FilterPreset {
  id: string;
  name: string;
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  inventoryTypeFilter: string;
  createdAt: string;
}

interface FilterPresetManagerProps {
  currentFilters: {
    searchTerm: string;
    categoryFilter: string;
    stockFilter: string;
    inventoryTypeFilter: string;
  };
  presets: FilterPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
  onUpdatePreset: (id: string, name: string) => void;
}

export const FilterPresetManager: React.FC<FilterPresetManagerProps> = ({
  currentFilters,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onUpdatePreset,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!presetName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the preset.',
        variant: 'destructive',
      });
      return;
    }

    if (presets.length >= 9) {
      toast({
        title: 'Maximum Presets Reached',
        description: 'You can only save up to 9 presets (Ctrl+1 through Ctrl+9).',
        variant: 'destructive',
      });
      return;
    }

    onSavePreset(presetName);
    setPresetName('');
    setSaveDialogOpen(false);
  };

  const handleEdit = () => {
    if (!editingPreset || !presetName.trim()) return;

    onUpdatePreset(editingPreset.id, presetName);
    setEditingPreset(null);
    setPresetName('');
    setEditDialogOpen(false);
  };

  const openEditDialog = (preset: FilterPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setEditDialogOpen(true);
  };

  const handleExport = () => {
    if (presets.length === 0) {
      toast({
        title: 'No Presets to Export',
        description: 'Create some presets first before exporting.',
        variant: 'destructive',
      });
      return;
    }

    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-filter-presets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Presets Exported',
      description: `Successfully exported ${presets.length} preset${presets.length > 1 ? 's' : ''}.`,
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string) as FilterPreset[];
        
        // Validate imported data
        if (!Array.isArray(importedPresets)) {
          throw new Error('Invalid format: expected an array of presets');
        }

        // Validate each preset has required fields
        for (const preset of importedPresets) {
          if (!preset.id || !preset.name || preset.searchTerm === undefined) {
            throw new Error('Invalid preset format: missing required fields');
          }
        }

        setImportDialogOpen(true);
        // Store imported presets temporarily for confirmation
        (window as any).__tempImportedPresets = importedPresets;
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Invalid file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    const importedPresets = (window as any).__tempImportedPresets as FilterPreset[];
    if (!importedPresets) return;

    let finalPresets: FilterPreset[];
    if (importMode === 'replace') {
      finalPresets = importedPresets;
    } else {
      // Merge: keep existing, add new ones with unique IDs
      const existingIds = new Set(presets.map(p => p.id));
      const newPresets = importedPresets.filter(p => !existingIds.has(p.id));
      finalPresets = [...presets, ...newPresets];
    }

    // Update presets through parent component
    finalPresets.forEach(preset => {
      if (!presets.find(p => p.id === preset.id)) {
        onSavePreset(preset.name);
        // Load the imported preset to trigger proper state update
        setTimeout(() => onLoadPreset(preset), 0);
      }
    });

    delete (window as any).__tempImportedPresets;
    setImportDialogOpen(false);

    toast({
      title: 'Presets Imported',
      description: `Successfully imported ${importedPresets.length} preset${importedPresets.length > 1 ? 's' : ''}.`,
    });
  };

  const getFilterSummary = (preset: FilterPreset) => {
    const parts: string[] = [];
    if (preset.searchTerm) parts.push(`Search: "${preset.searchTerm}"`);
    if (preset.categoryFilter !== 'all') parts.push(`Category: ${preset.categoryFilter}`);
    if (preset.inventoryTypeFilter !== 'all') parts.push(`Type: ${preset.inventoryTypeFilter}`);
    if (preset.stockFilter !== 'all') parts.push(`Stock: ${preset.stockFilter}`);
    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <span>Filter Presets</span>
            {presets.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {presets.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 z-50 bg-background">
          <div className="p-2 space-y-2">
            <Button
              onClick={() => setSaveDialogOpen(true)}
              size="sm"
              className="w-full justify-start"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Filters as Preset
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                size="sm"
                variant="outline"
                className="flex-1 justify-start"
                disabled={presets.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant="outline"
                className="flex-1 justify-start"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          {presets.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {presets.map((preset, index) => (
                  <div
                    key={preset.id}
                    className="group hover:bg-accent p-2 cursor-pointer transition-colors"
                  >
                    <div
                      className="flex items-start justify-between"
                      onClick={() => onLoadPreset(preset)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {preset.name}
                          </span>
                          {index < 9 && (
                            <Badge variant="outline" className="text-xs">
                              Ctrl+{index + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {getFilterSummary(preset)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(preset);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePreset(preset.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {presets.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No saved presets yet. Save your current filters to get started!
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give your filter preset a memorable name. You'll be able to quickly load it later
              with keyboard shortcuts (Ctrl+1 through Ctrl+9).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Low Stock Items, Spare Parts Only"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-medium">Current Filters:</p>
              <p className="text-xs text-muted-foreground">
                {getFilterSummary({
                  ...currentFilters,
                  id: '',
                  name: '',
                  createdAt: '',
                })}
              </p>
            </div>
            {presets.length >= 9 && (
              <p className="text-xs text-destructive">
                Maximum of 9 presets reached. Delete a preset to save a new one.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={presets.length >= 9}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Preset Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Preset Name</DialogTitle>
            <DialogDescription>
              Update the name of your filter preset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name">Preset Name</Label>
              <Input
                id="edit-preset-name"
                placeholder="Enter preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Filter Presets</DialogTitle>
            <DialogDescription>
              Choose how to import the presets from the file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Import Mode</Label>
              <div className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    importMode === 'merge'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setImportMode('merge')}
                >
                  <div className="font-medium">Merge with Existing</div>
                  <div className="text-sm text-muted-foreground">
                    Add imported presets to your current ones (duplicates will be skipped)
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    importMode === 'replace'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setImportMode('replace')}
                >
                  <div className="font-medium">Replace All</div>
                  <div className="text-sm text-muted-foreground">
                    Remove existing presets and replace with imported ones
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Importing:</span>{' '}
                {(window as any).__tempImportedPresets?.length || 0} preset(s)
              </p>
              {presets.length > 0 && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Current:</span> {presets.length} preset(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                delete (window as any).__tempImportedPresets;
                setImportDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmImport}>Import Presets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
