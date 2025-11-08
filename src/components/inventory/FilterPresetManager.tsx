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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Bookmark, Trash2, Edit2, Star, Download, Upload, Copy, Tag, RotateCcw, Lightbulb, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export interface FilterPreset {
  id: string;
  name: string;
  category?: string;
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  inventoryTypeFilter: string;
  createdAt: string;
  usageCount?: number;
  lastUsed?: string;
}

interface FilterPresetManagerProps {
  currentFilters: {
    searchTerm: string;
    categoryFilter: string;
    stockFilter: string;
    inventoryTypeFilter: string;
  };
  presets: FilterPreset[];
  onSavePreset: (name: string, category?: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
  onUpdatePreset: (id: string, name: string, category?: string) => void;
  onResetUsageStats: (id?: string) => void;
  matchedPreset?: FilterPreset | null;
  onDismissMatch?: () => void;
}

const DEFAULT_CATEGORIES = [
  'Low Stock',
  'Critical Items',
  'By Location',
  'By Type',
  'Custom Filters',
];

export const FilterPresetManager: React.FC<FilterPresetManagerProps> = ({
  currentFilters,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onUpdatePreset,
  onResetUsageStats,
  matchedPreset,
  onDismissMatch,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetCategory, setPresetCategory] = useState<string>('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [duplicatingPreset, setDuplicatingPreset] = useState<FilterPreset | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const focusedItemRef = React.useRef<HTMLDivElement>(null);

  // Get all unique categories from existing presets
  const allCategories = React.useMemo(() => {
    const customCategories = Array.from(
      new Set(presets.map((p) => p.category).filter(Boolean))
    ) as string[];
    return [...DEFAULT_CATEGORIES, ...customCategories.filter((c) => !DEFAULT_CATEGORIES.includes(c))];
  }, [presets]);

  // Flatten presets for keyboard navigation
  const flatPresets = React.useMemo(() => {
    return presets;
  }, [presets]);

  // Get recently used presets (top 3)
  const recentlyUsedPresets = React.useMemo(() => {
    return presets
      .filter(p => p.lastUsed)
      .sort((a, b) => {
        const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
        const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [presets]);

  // Analytics calculations
  const analyticsData = React.useMemo(() => {
    const totalUsage = presets.reduce((sum, p) => sum + (p.usageCount || 0), 0);
    const totalPresets = presets.length;
    const presetsWithUsage = presets.filter(p => p.usageCount && p.usageCount > 0).length;

    // Most popular presets
    const mostPopular = [...presets]
      .filter(p => p.usageCount && p.usageCount > 0)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        usage: p.usageCount || 0,
      }));

    // Category breakdown
    const categoryUsage: Record<string, number> = {};
    presets.forEach(p => {
      const category = p.category || 'Uncategorized';
      categoryUsage[category] = (categoryUsage[category] || 0) + (p.usageCount || 0);
    });

    const categoryData = Object.entries(categoryUsage)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Average usage per preset
    const avgUsage = presetsWithUsage > 0 ? (totalUsage / presetsWithUsage).toFixed(1) : '0';

    return {
      totalUsage,
      totalPresets,
      presetsWithUsage,
      avgUsage,
      mostPopular,
      categoryData,
    };
  }, [presets]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

  // Reset focus when dropdown closes
  React.useEffect(() => {
    if (!dropdownOpen) {
      setFocusedIndex(-1);
    }
  }, [dropdownOpen]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex >= 0 && focusedItemRef.current) {
      focusedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!dropdownOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1;
          return next >= flatPresets.length ? 0 : next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? flatPresets.length - 1 : next;
        });
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        const preset = flatPresets[focusedIndex];
        if (preset) {
          onLoadPreset(preset);
          setDropdownOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen, focusedIndex, flatPresets, onLoadPreset]);

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

    const finalCategory = showCustomCategoryInput && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : presetCategory || undefined;

    onSavePreset(presetName, finalCategory);
    setPresetName('');
    setPresetCategory('');
    setCustomCategoryInput('');
    setShowCustomCategoryInput(false);
    setDuplicatingPreset(null);
    setSaveDialogOpen(false);
  };

  const handleEdit = () => {
    if (!editingPreset || !presetName.trim()) return;

    const finalCategory = showCustomCategoryInput && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : presetCategory || undefined;

    onUpdatePreset(editingPreset.id, presetName, finalCategory);
    setEditingPreset(null);
    setPresetName('');
    setPresetCategory('');
    setCustomCategoryInput('');
    setShowCustomCategoryInput(false);
    setEditDialogOpen(false);
  };

  const openEditDialog = (preset: FilterPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetCategory(preset.category || '');
    setCustomCategoryInput('');
    setShowCustomCategoryInput(false);
    setEditDialogOpen(true);
  };

  const handleDuplicate = (preset: FilterPreset) => {
    // Load the preset's filters first
    onLoadPreset(preset);
    // Set duplicating state and open save dialog with pre-filled name and category
    setDuplicatingPreset(preset);
    setPresetName(`Copy of ${preset.name}`);
    setPresetCategory(preset.category || '');
    setSaveDialogOpen(true);
  };

  const handleResetAllStats = () => {
    onResetUsageStats();
    setResetConfirmOpen(false);
    setDropdownOpen(false);
  };

  const handleResetIndividualStats = (presetId: string, presetName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onResetUsageStats(presetId);
    toast({
      title: 'Usage Statistics Reset',
      description: `Usage stats for "${presetName}" have been reset.`,
    });
  };

  // Group presets by category and sort by usage
  const groupedPresets = React.useMemo(() => {
    const groups: Record<string, FilterPreset[]> = {};
    
    presets.forEach((preset) => {
      const category = preset.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(preset);
    });

    // Sort presets within each category by usage count (descending)
    Object.keys(groups).forEach((category) => {
      groups[category].sort((a, b) => {
        const usageA = a.usageCount || 0;
        const usageB = b.usageCount || 0;
        if (usageB !== usageA) {
          return usageB - usageA; // Most used first
        }
        // If same usage, sort by last used (most recent first)
        if (a.lastUsed && b.lastUsed) {
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        }
        // If no usage data, sort by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    return groups;
  }, [presets]);

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

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Preset Match Notification */}
      {matchedPreset && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Current filters match "{matchedPreset.name}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {matchedPreset.category && `Category: ${matchedPreset.category} • `}
              Used {matchedPreset.usageCount || 0} time{(matchedPreset.usageCount || 0) === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                onLoadPreset(matchedPreset);
                onDismissMatch?.();
              }}
            >
              Load Preset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismissMatch}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
        <DropdownMenuContent 
          ref={dropdownRef}
          align="start" 
          className="w-80 z-50 bg-background border border-border shadow-lg"
        >
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
            <Button
              onClick={() => setAnalyticsOpen(true)}
              size="sm"
              variant="outline"
              className="w-full justify-start"
              disabled={presets.length === 0}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            {presets.some(p => p.usageCount && p.usageCount > 0) && (
              <Button
                onClick={() => setResetConfirmOpen(true)}
                size="sm"
                variant="outline"
                className="w-full justify-start text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Usage Statistics
              </Button>
            )}
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
              {recentlyUsedPresets.length > 0 && (
                <>
                  <div className="px-2 py-1.5 flex items-center gap-2 bg-muted/50">
                    <Star className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Recently Used
                    </span>
                  </div>
                  <div className="pb-2">
                    {recentlyUsedPresets.map((preset) => {
                      const globalIndex = presets.findIndex((p) => p.id === preset.id);
                      const isFocused = focusedIndex === globalIndex;
                      const timeAgo = preset.lastUsed 
                        ? getTimeAgo(new Date(preset.lastUsed))
                        : '';
                      return (
                        <div
                          key={preset.id}
                          ref={isFocused ? focusedItemRef : null}
                          className={`group p-2 cursor-pointer transition-colors ${
                            isFocused 
                              ? 'bg-accent border-l-2 border-primary' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div
                            className="flex items-start justify-between"
                            onClick={() => {
                              onLoadPreset(preset);
                              setDropdownOpen(false);
                            }}
                            onMouseEnter={() => setFocusedIndex(globalIndex)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                  {preset.name}
                                </span>
                                {preset.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {preset.category}
                                  </Badge>
                                )}
                                {globalIndex < 9 && (
                                  <Badge variant="outline" className="text-xs">
                                    Ctrl+{globalIndex + 1}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {timeAgo && `Used ${timeAgo}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-2 py-1.5 flex items-center gap-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {category}
                      </span>
                    </div>
                    {categoryPresets.map((preset) => {
                      const globalIndex = presets.findIndex((p) => p.id === preset.id);
                      const isFocused = focusedIndex === globalIndex;
                      return (
                        <div
                          key={preset.id}
                          ref={isFocused ? focusedItemRef : null}
                          className={`group p-2 cursor-pointer transition-colors ${
                            isFocused 
                              ? 'bg-accent border-l-2 border-primary' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div
                            className="flex items-start justify-between"
                            onClick={() => {
                              onLoadPreset(preset);
                              setDropdownOpen(false);
                            }}
                            onMouseEnter={() => setFocusedIndex(globalIndex)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                <span className="font-medium text-sm truncate">
                                  {preset.name}
                                </span>
                                {globalIndex < 9 && (
                                  <Badge variant="outline" className="text-xs">
                                    Ctrl+{globalIndex + 1}
                                  </Badge>
                                )}
                                {preset.usageCount && preset.usageCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {preset.usageCount} use{preset.usageCount === 1 ? '' : 's'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {getFilterSummary(preset)}
                              </p>
                            </div>
                            <div className={`flex gap-1 transition-opacity ml-2 ${
                              isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              {preset.usageCount && preset.usageCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => handleResetIndividualStats(preset.id, preset.name, e)}
                                  title="Reset usage statistics"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(preset);
                                  setDropdownOpen(false);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(preset);
                                  setDropdownOpen(false);
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
                      );
                    })}
                  </div>
                ))}
              </div>
              {presets.length > 0 && (
                <div className="px-3 py-2 border-t border-border bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    Use ↑↓ arrows to navigate, Enter to load, Esc to close
                  </p>
                </div>
              )}
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
      <Dialog open={saveDialogOpen} onOpenChange={(open) => {
        setSaveDialogOpen(open);
        if (!open) {
          setDuplicatingPreset(null);
          setPresetName('');
          setPresetCategory('');
          setCustomCategoryInput('');
          setShowCustomCategoryInput(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {duplicatingPreset ? 'Duplicate Filter Preset' : 'Save Filter Preset'}
            </DialogTitle>
            <DialogDescription>
              {duplicatingPreset
                ? 'Create a copy of the selected preset with a new name.'
                : "Give your filter preset a memorable name. You'll be able to quickly load it later with keyboard shortcuts (Ctrl+1 through Ctrl+9)."}
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
                  if (e.key === 'Enter' && !showCustomCategoryInput) {
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preset-category">Category (Optional)</Label>
              <Select
                value={showCustomCategoryInput ? 'custom' : presetCategory}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomCategoryInput(true);
                    setPresetCategory('');
                  } else {
                    setShowCustomCategoryInput(false);
                    setPresetCategory(value);
                  }
                }}
              >
                <SelectTrigger id="preset-category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Create Custom Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCustomCategoryInput && (
              <div className="space-y-2">
                <Label htmlFor="custom-category">Custom Category Name</Label>
                <Input
                  id="custom-category"
                  placeholder="e.g., Seasonal Items"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                  autoFocus
                />
              </div>
            )}
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-medium">
                {duplicatingPreset ? 'Duplicated Filters:' : 'Current Filters:'}
              </p>
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
            <Button variant="outline" onClick={() => {
              setSaveDialogOpen(false);
              setDuplicatingPreset(null);
              setPresetName('');
              setPresetCategory('');
              setCustomCategoryInput('');
              setShowCustomCategoryInput(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={presets.length >= 9}>
              {duplicatingPreset ? 'Duplicate Preset' : 'Save Preset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Preset Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingPreset(null);
          setPresetName('');
          setPresetCategory('');
          setCustomCategoryInput('');
          setShowCustomCategoryInput(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Preset</DialogTitle>
            <DialogDescription>
              Update the name and category of your filter preset.
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
                  if (e.key === 'Enter' && !showCustomCategoryInput) {
                    handleEdit();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-category">Category (Optional)</Label>
              <Select
                value={showCustomCategoryInput ? 'custom' : presetCategory}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomCategoryInput(true);
                    setPresetCategory('');
                  } else {
                    setShowCustomCategoryInput(false);
                    setPresetCategory(value);
                  }
                }}
              >
                <SelectTrigger id="edit-preset-category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Create Custom Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCustomCategoryInput && (
              <div className="space-y-2">
                <Label htmlFor="edit-custom-category">Custom Category Name</Label>
                <Input
                  id="edit-custom-category"
                  placeholder="e.g., Seasonal Items"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEdit();
                    }
                  }}
                  autoFocus
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setEditingPreset(null);
              setPresetName('');
              setPresetCategory('');
              setCustomCategoryInput('');
              setShowCustomCategoryInput(false);
            }}>
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

      {/* Reset All Usage Stats Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Usage Statistics?</DialogTitle>
            <DialogDescription>
              This will reset the usage count and last used date for all presets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Presets with usage data:</span>{' '}
                {presets.filter(p => p.usageCount && p.usageCount > 0).length}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetAllStats}>
              Reset All Statistics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dashboard */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Preset Analytics Dashboard
            </DialogTitle>
            <DialogDescription>
              Insights into your filter preset usage patterns and trends
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Presets</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.totalPresets}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.totalUsage}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Active Presets</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.presetsWithUsage}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Usage</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.avgUsage}</p>
              </div>
            </div>

            {/* Most Popular Presets Chart */}
            {analyticsData.mostPopular.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Most Popular Presets</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.mostPopular}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No usage data available yet. Start using presets to see analytics.</p>
              </div>
            )}

            {/* Category Breakdown Chart */}
            {analyticsData.categoryData.length > 0 && analyticsData.totalUsage > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Usage by Category</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {analyticsData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="flex-1 space-y-2">
                    {analyticsData.categoryData.map((cat, index) => (
                      <div key={cat.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{cat.value} uses</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unused Presets */}
            {analyticsData.totalPresets > analyticsData.presetsWithUsage && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Unused Presets</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You have <span className="font-semibold text-foreground">
                      {analyticsData.totalPresets - analyticsData.presetsWithUsage}
                    </span> preset{analyticsData.totalPresets - analyticsData.presetsWithUsage === 1 ? '' : 's'} that {analyticsData.totalPresets - analyticsData.presetsWithUsage === 1 ? 'has' : 'have'} never been used.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Consider reviewing and removing unused presets to keep your list organized.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setAnalyticsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
