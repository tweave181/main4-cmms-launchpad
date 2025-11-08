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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Bookmark, Trash2, Edit2, Star, Download, Upload, Copy, Tag, RotateCcw, Lightbulb, BarChart3, FileDown, CalendarIcon, TrendingUp, TrendingDown, Minus, Calendar as CalendarDays, AlertCircle, CheckCircle, Sparkles, Archive, Trash, Combine } from 'lucide-react';
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay, getDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
  usageHistory?: Array<{ date: string; count: number }>;
  archived?: boolean;
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
  onUpdatePresets: (presets: FilterPreset[]) => void;
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
  onUpdatePresets,
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
  const [dateRangeFilter, setDateRangeFilter] = useState<'7days' | '30days' | 'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [trendView, setTrendView] = useState<'daily' | 'weekly'>('daily');
  const [selectedPresetForTrend, setSelectedPresetForTrend] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
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

  // Get date range for filtering
  const getDateRange = () => {
    const now = new Date();
    if (dateRangeFilter === '7days') {
      return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
    } else if (dateRangeFilter === '30days') {
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
    } else if (dateRangeFilter === 'custom' && customStartDate && customEndDate) {
      return { start: startOfDay(customStartDate), end: endOfDay(customEndDate) };
    }
    return null; // 'all' - no filtering
  };

  // Filter presets by date range
  const filteredPresetsByDate = React.useMemo(() => {
    const dateRange = getDateRange();
    if (!dateRange) return presets;

    return presets.map(preset => {
      // If the preset has never been used, exclude it from date-filtered analytics
      if (!preset.lastUsed) {
        return { ...preset, usageCount: 0 };
      }

      const lastUsedDate = new Date(preset.lastUsed);
      const isInRange = isAfter(lastUsedDate, dateRange.start) && isBefore(lastUsedDate, dateRange.end);
      
      // If not in range, set usage to 0 for this filtered view
      return {
        ...preset,
        usageCount: isInRange ? preset.usageCount : 0,
      };
    });
  }, [presets, dateRangeFilter, customStartDate, customEndDate]);

  // Analytics calculations
  const analyticsData = React.useMemo(() => {
    const dataSource = filteredPresetsByDate;
    const totalUsage = dataSource.reduce((sum, p) => sum + (p.usageCount || 0), 0);
    const totalPresets = presets.length;
    const presetsWithUsage = dataSource.filter(p => p.usageCount && p.usageCount > 0).length;

    // Most popular presets
    const mostPopular = [...dataSource]
      .filter(p => p.usageCount && p.usageCount > 0)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        usage: p.usageCount || 0,
      }));

    // Category breakdown
    const categoryUsage: Record<string, number> = {};
    dataSource.forEach(p => {
      const category = p.category || 'Uncategorized';
      categoryUsage[category] = (categoryUsage[category] || 0) + (p.usageCount || 0);
    });

    const categoryData = Object.entries(categoryUsage)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Average usage per preset
    const avgUsage = presetsWithUsage > 0 ? (totalUsage / presetsWithUsage).toFixed(1) : '0';

    // Usage trend over time
    const trendData: Record<string, { date: string; usage: number }> = {};
    const dateRange = getDateRange();
    
    dataSource.forEach(preset => {
      if (preset.usageHistory && preset.usageHistory.length > 0) {
        preset.usageHistory.forEach(entry => {
          const entryDate = new Date(entry.date);
          
          // Filter by date range if applicable
          if (dateRange) {
            if (isBefore(entryDate, dateRange.start) || isAfter(entryDate, dateRange.end)) {
              return;
            }
          }
          
          const dateKey = format(entryDate, 'MMM dd');
          if (!trendData[dateKey]) {
            trendData[dateKey] = { date: dateKey, usage: 0 };
          }
          trendData[dateKey].usage += entry.count;
        });
      }
    });

    const usageTrend = Object.values(trendData).sort((a, b) => {
      const dateA = new Date(a.date + ', 2024');
      const dateB = new Date(b.date + ', 2024');
      return dateA.getTime() - dateB.getTime();
    });

    // Individual preset trends
    const getIndividualPresetTrend = (presetId: string) => {
      const preset = dataSource.find(p => p.id === presetId);
      if (!preset || !preset.usageHistory || preset.usageHistory.length === 0) {
        return [];
      }

      const presetTrendData: Record<string, { date: string; usage: number }> = {};
      const dateRange = getDateRange();

      preset.usageHistory.forEach(entry => {
        const entryDate = new Date(entry.date);
        
        // Filter by date range if applicable
        if (dateRange) {
          if (isBefore(entryDate, dateRange.start) || isAfter(entryDate, dateRange.end)) {
            return;
          }
        }
        
        const dateKey = trendView === 'daily' 
          ? format(entryDate, 'MMM dd')
          : `Week ${format(entryDate, 'w')}`;
        
        if (!presetTrendData[dateKey]) {
          presetTrendData[dateKey] = { date: dateKey, usage: 0 };
        }
        presetTrendData[dateKey].usage += entry.count;
      });

      return Object.values(presetTrendData).sort((a, b) => {
        if (trendView === 'daily') {
          const dateA = new Date(a.date + ', 2024');
          const dateB = new Date(b.date + ', 2024');
          return dateA.getTime() - dateB.getTime();
        } else {
          // For weekly, extract week number and sort
          const weekA = parseInt(a.date.replace('Week ', ''));
          const weekB = parseInt(b.date.replace('Week ', ''));
          return weekA - weekB;
        }
      });
    };

    // Combined trends for multiple selected presets
    const individualPresetTrends = selectedPresetForTrend.map(presetId => {
      const preset = dataSource.find(p => p.id === presetId);
      return {
        presetId,
        presetName: preset?.name || 'Unknown',
        data: getIndividualPresetTrend(presetId),
      };
    });

    // Pattern insights detection
    const getPatternInsights = (presetId: string) => {
      const preset = dataSource.find(p => p.id === presetId);
      if (!preset || !preset.usageHistory || preset.usageHistory.length < 3) {
        return null;
      }

      const insights: {
        trend: 'increasing' | 'decreasing' | 'stable';
        trendPercentage: number;
        mostActiveDay?: string;
        leastActiveDay?: string;
        avgDailyUsage: number;
        peakUsageDate?: string;
        recentActivity: 'active' | 'inactive' | 'moderate';
      } = {
        trend: 'stable',
        trendPercentage: 0,
        avgDailyUsage: 0,
        recentActivity: 'moderate',
      };

      const dateRange = getDateRange();
      const filteredHistory = preset.usageHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        if (dateRange) {
          return isAfter(entryDate, dateRange.start) && isBefore(entryDate, dateRange.end);
        }
        return true;
      });

      if (filteredHistory.length < 3) return null;

      // Day of week analysis
      const dayUsage: Record<number, number> = {};
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      filteredHistory.forEach(entry => {
        const day = getDay(parseISO(entry.date));
        dayUsage[day] = (dayUsage[day] || 0) + entry.count;
      });

      if (Object.keys(dayUsage).length > 0) {
        const sortedDays = Object.entries(dayUsage)
          .sort(([, a], [, b]) => b - a);
        
        if (sortedDays.length > 0) {
          insights.mostActiveDay = dayNames[parseInt(sortedDays[0][0])];
          if (sortedDays.length > 1) {
            insights.leastActiveDay = dayNames[parseInt(sortedDays[sortedDays.length - 1][0])];
          }
        }
      }

      // Trend analysis (compare first half vs second half)
      const midpoint = Math.floor(filteredHistory.length / 2);
      const firstHalf = filteredHistory.slice(0, midpoint);
      const secondHalf = filteredHistory.slice(midpoint);

      const firstHalfTotal = firstHalf.reduce((sum, e) => sum + e.count, 0);
      const secondHalfTotal = secondHalf.reduce((sum, e) => sum + e.count, 0);

      const firstHalfAvg = firstHalfTotal / firstHalf.length;
      const secondHalfAvg = secondHalfTotal / secondHalf.length;

      const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      insights.trendPercentage = Math.abs(percentChange);

      if (percentChange > 20) {
        insights.trend = 'increasing';
      } else if (percentChange < -20) {
        insights.trend = 'decreasing';
      } else {
        insights.trend = 'stable';
      }

      // Average daily usage
      const totalUsage = filteredHistory.reduce((sum, e) => sum + e.count, 0);
      insights.avgDailyUsage = parseFloat((totalUsage / filteredHistory.length).toFixed(1));

      // Peak usage date
      const peakEntry = filteredHistory.reduce((max, entry) => 
        entry.count > max.count ? entry : max
      , filteredHistory[0]);
      insights.peakUsageDate = format(parseISO(peakEntry.date), 'MMM dd, yyyy');

      // Recent activity (last 7 days)
      const sevenDaysAgo = subDays(new Date(), 7);
      const recentEntries = filteredHistory.filter(entry => 
        isAfter(parseISO(entry.date), sevenDaysAgo)
      );
      const recentUsage = recentEntries.reduce((sum, e) => sum + e.count, 0);

      if (recentUsage === 0) {
        insights.recentActivity = 'inactive';
      } else if (recentUsage >= insights.avgDailyUsage * 5) {
        insights.recentActivity = 'active';
      } else {
        insights.recentActivity = 'moderate';
      }

      return insights;
    };

    // Add insights to individual preset trends
    const individualPresetTrendsWithInsights = individualPresetTrends.map(trend => ({
      ...trend,
      insights: getPatternInsights(trend.presetId),
    }));

    return {
      totalUsage,
      totalPresets,
      presetsWithUsage,
      avgUsage,
      mostPopular,
      categoryData,
      usageTrend,
      individualPresetTrends: individualPresetTrendsWithInsights,
      getIndividualPresetTrend,
    };
  }, [filteredPresetsByDate, presets, dateRangeFilter, customStartDate, customEndDate, trendView, selectedPresetForTrend]);

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

  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationsOpen(true);

    try {
      // Prepare preset data with insights
      const presetData = presets.map(preset => {
        const insights = analyticsData.individualPresetTrends
          .find(t => t.presetId === preset.id)?.insights;

        return {
          id: preset.id,
          name: preset.name,
          category: preset.category,
          usageCount: preset.usageCount || 0,
          lastUsed: preset.lastUsed,
          insights: insights || undefined,
        };
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/preset-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ presets: presetData }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits required. Please add credits to your workspace.');
        }
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
      
      toast({
        title: 'Recommendations Generated',
        description: `Found ${data.recommendations?.length || 0} optimization suggestions.`,
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate recommendations',
        variant: 'destructive',
      });
      setRecommendationsOpen(false);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'keep':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archive':
        return <Archive className="h-4 w-4 text-blue-500" />;
      case 'combine':
        return <Combine className="h-4 w-4 text-purple-500" />;
      case 'delete':
        return <Trash className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'keep':
        return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
      case 'archive':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'combine':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'delete':
        return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return '';
    }
  };

  const handleApplyRecommendation = async (recommendation: any) => {
    const { action, presetNames } = recommendation;

    switch (action) {
      case 'keep':
        // Just show success message - no action needed
        toast({
          title: 'Preset Marked',
          description: `"${presetNames.join('", "')}" marked as important to keep.`,
        });
        break;

      case 'archive':
        // Add archived flag to presets
        const archivedPresets = presets.map(p => {
          if (presetNames.includes(p.name)) {
            return { ...p, archived: true };
          }
          return p;
        });
        onUpdatePresets(archivedPresets);
        toast({
          title: 'Presets Archived',
          description: `${presetNames.length} preset${presetNames.length > 1 ? 's' : ''} archived successfully.`,
        });
        break;

      case 'delete':
        // Delete the presets
        presetNames.forEach((name: string) => {
          const preset = presets.find(p => p.name === name);
          if (preset) {
            onDeletePreset(preset.id);
          }
        });
        toast({
          title: 'Presets Deleted',
          description: `${presetNames.length} preset${presetNames.length > 1 ? 's' : ''} deleted successfully.`,
        });
        break;

      case 'combine':
        // Merge presets into one
        if (presetNames.length < 2) {
          toast({
            title: 'Cannot Combine',
            description: 'Need at least 2 presets to combine.',
            variant: 'destructive',
          });
          return;
        }

        const presetsToMerge = presets.filter(p => presetNames.includes(p.name));
        if (presetsToMerge.length === 0) return;

        // Create combined preset name
        const combinedName = `Combined: ${presetNames.slice(0, 2).join(' + ')}${presetNames.length > 2 ? ` +${presetNames.length - 2}` : ''}`;
        
        // Merge usage data
        const totalUsage = presetsToMerge.reduce((sum, p) => sum + (p.usageCount || 0), 0);
        const allHistory = presetsToMerge.flatMap(p => p.usageHistory || []);
        
        // Use the first preset's filters as the base
        const basePreset = presetsToMerge[0];
        
        const mergedPreset: FilterPreset = {
          id: `preset-${Date.now()}`,
          name: combinedName,
          category: basePreset.category,
          searchTerm: basePreset.searchTerm,
          categoryFilter: basePreset.categoryFilter,
          stockFilter: basePreset.stockFilter,
          inventoryTypeFilter: basePreset.inventoryTypeFilter,
          createdAt: new Date().toISOString(),
          usageCount: totalUsage,
          usageHistory: allHistory,
          lastUsed: presetsToMerge
            .map(p => p.lastUsed)
            .filter(Boolean)
            .sort()
            .reverse()[0],
        };

        // Remove original presets and add merged one
        const updatedPresets = [
          ...presets.filter(p => !presetNames.includes(p.name)),
          mergedPreset,
        ];
        onUpdatePresets(updatedPresets);
        
        toast({
          title: 'Presets Combined',
          description: `Created "${combinedName}" from ${presetNames.length} presets.`,
        });
        break;

      default:
        toast({
          title: 'Unknown Action',
          description: 'This action is not supported.',
          variant: 'destructive',
        });
    }

    // Refresh recommendations after action
    setTimeout(() => {
      handleGetRecommendations();
    }, 500);
  };

  const handleExportAnalytics = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Filter Preset Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date and Date Range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    
    // Show date range filter
    let dateRangeText = 'Period: All Time';
    if (dateRangeFilter === '7days') {
      dateRangeText = 'Period: Last 7 Days';
    } else if (dateRangeFilter === '30days') {
      dateRangeText = 'Period: Last 30 Days';
    } else if (dateRangeFilter === 'custom' && customStartDate && customEndDate) {
      dateRangeText = `Period: ${format(customStartDate, 'PP')} - ${format(customEndDate, 'PP')}`;
    }
    doc.text(dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Summary Stats
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Presets: ${analyticsData.totalPresets}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Usage: ${analyticsData.totalUsage}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Active Presets: ${analyticsData.presetsWithUsage}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Average Usage per Preset: ${analyticsData.avgUsage}`, 20, yPosition);
    yPosition += 15;

    // Most Popular Presets
    if (analyticsData.mostPopular.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Most Popular Presets', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      analyticsData.mostPopular.forEach((preset, index) => {
        const fullPreset = presets.find(p => p.name.startsWith(preset.name.replace('...', '')));
        const fullName = fullPreset?.name || preset.name;
        doc.text(`${index + 1}. ${fullName}: ${preset.usage} uses`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Category Breakdown
    if (analyticsData.categoryData.length > 0 && analyticsData.totalUsage > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Usage by Category', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      analyticsData.categoryData.forEach((cat) => {
        const percentage = ((cat.value / analyticsData.totalUsage) * 100).toFixed(1);
        doc.text(`${cat.name}: ${cat.value} uses (${percentage}%)`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Unused Presets
    if (analyticsData.totalPresets > analyticsData.presetsWithUsage) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Unused Presets', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const unusedCount = analyticsData.totalPresets - analyticsData.presetsWithUsage;
      doc.text(`${unusedCount} preset${unusedCount === 1 ? '' : 's'} ${unusedCount === 1 ? 'has' : 'have'} never been used${dateRangeFilter !== 'all' ? ' in this period' : ''}.`, 25, yPosition);
      yPosition += 6;

      const unusedPresets = filteredPresetsByDate.filter(p => !p.usageCount || p.usageCount === 0);
      unusedPresets.forEach((preset) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`- ${preset.name}${preset.category ? ` (${preset.category})` : ''}`, 30, yPosition);
        yPosition += 5;
      });
    }

    // Save PDF
    const fileName = `preset-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    toast({
      title: 'Analytics Exported',
      description: `PDF report saved as ${fileName}`,
    });
  };

  // Group presets by category and sort by usage
  const groupedPresets = React.useMemo(() => {
    const groups: Record<string, FilterPreset[]> = {};
    
    // Filter out archived presets
    const activePresets = presets.filter(p => !p.archived);
    
    activePresets.forEach((preset) => {
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
            <Button
              onClick={handleGetRecommendations}
              size="sm"
              variant="outline"
              className="w-full justify-start"
              disabled={presets.length === 0}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Recommendations
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
            {/* Date Range Filter */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
              <Label className="text-sm font-medium">Time Period:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={dateRangeFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setDateRangeFilter('all')}
                >
                  All Time
                </Button>
                <Button
                  size="sm"
                  variant={dateRangeFilter === '7days' ? 'default' : 'outline'}
                  onClick={() => setDateRangeFilter('7days')}
                >
                  Last 7 Days
                </Button>
                <Button
                  size="sm"
                  variant={dateRangeFilter === '30days' ? 'default' : 'outline'}
                  onClick={() => setDateRangeFilter('30days')}
                >
                  Last 30 Days
                </Button>
                <Button
                  size="sm"
                  variant={dateRangeFilter === 'custom' ? 'default' : 'outline'}
                  onClick={() => setDateRangeFilter('custom')}
                >
                  Custom Range
                </Button>
              </div>
              
              {/* Custom Date Range Pickers */}
              {dateRangeFilter === 'custom' && (
                <div className="flex flex-wrap items-center gap-2 w-full mt-2">
                  <Label className="text-xs">From:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Label className="text-xs">To:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        disabled={(date) => 
                          date > new Date() || 
                          (customStartDate ? date < customStartDate : false)
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

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

            {/* Individual Preset Trends */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Individual Preset Trends
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">View:</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={trendView === 'daily' ? 'default' : 'outline'}
                      onClick={() => setTrendView('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      size="sm"
                      variant={trendView === 'weekly' ? 'default' : 'outline'}
                      onClick={() => setTrendView('weekly')}
                    >
                      Weekly
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preset Selection */}
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Select Presets to Compare (max 5):</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {presets
                    .filter(p => p.usageHistory && p.usageHistory.length > 0)
                    .map((preset) => (
                      <div key={preset.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`preset-${preset.id}`}
                          checked={selectedPresetForTrend.includes(preset.id)}
                          onCheckedChange={(checked) => {
                            if (checked && selectedPresetForTrend.length < 5) {
                              setSelectedPresetForTrend([...selectedPresetForTrend, preset.id]);
                            } else if (!checked) {
                              setSelectedPresetForTrend(selectedPresetForTrend.filter(id => id !== preset.id));
                            } else {
                              toast({
                                title: 'Maximum Reached',
                                description: 'You can compare up to 5 presets at once.',
                                variant: 'destructive',
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`preset-${preset.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {preset.name}
                          {preset.category && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {preset.category}
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                </div>
                {presets.filter(p => p.usageHistory && p.usageHistory.length > 0).length === 0 && (
                  <p className="text-sm text-muted-foreground">No presets with usage history yet.</p>
                )}
              </div>

              {/* Individual Preset Trend Charts */}
              {selectedPresetForTrend.length > 0 ? (
                <div className="space-y-6">
                  {analyticsData.individualPresetTrends.map((trend, index) => (
                    <div key={trend.presetId} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {trend.presetName}
                        </h4>
                        <Badge variant="secondary">
                          {trend.data.reduce((sum, d) => sum + d.usage, 0)} total uses
                        </Badge>
                      </div>

                      {/* Pattern Insights */}
                      {trend.insights && (
                        <div className="mb-4 p-3 bg-background rounded-lg border border-border space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Usage Insights
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {/* Trend Badge */}
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              {trend.insights.trend === 'increasing' && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                      Growing
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      +{trend.insights.trendPercentage.toFixed(0)}%
                                    </p>
                                  </div>
                                </>
                              )}
                              {trend.insights.trend === 'decreasing' && (
                                <>
                                  <TrendingDown className="h-4 w-4 text-orange-500" />
                                  <div>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                      Declining
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      -{trend.insights.trendPercentage.toFixed(0)}%
                                    </p>
                                  </div>
                                </>
                              )}
                              {trend.insights.trend === 'stable' && (
                                <>
                                  <Minus className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      Stable
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ±{trend.insights.trendPercentage.toFixed(0)}%
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Most Active Day */}
                            {trend.insights.mostActiveDay && (
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-xs font-medium">Most Active</p>
                                  <p className="text-xs text-muted-foreground">
                                    {trend.insights.mostActiveDay}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Recent Activity */}
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              {trend.insights.recentActivity === 'active' && (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                      Active
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Last 7 days
                                    </p>
                                  </div>
                                </>
                              )}
                              {trend.insights.recentActivity === 'inactive' && (
                                <>
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  <div>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                      Inactive
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Last 7 days
                                    </p>
                                  </div>
                                </>
                              )}
                              {trend.insights.recentActivity === 'moderate' && (
                                <>
                                  <Minus className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      Moderate
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Last 7 days
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Average Daily Usage */}
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <BarChart3 className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs font-medium">Avg Daily</p>
                                <p className="text-xs text-muted-foreground">
                                  {trend.insights.avgDailyUsage} uses
                                </p>
                              </div>
                            </div>

                            {/* Peak Usage */}
                            {trend.insights.peakUsageDate && (
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <div>
                                  <p className="text-xs font-medium">Peak Day</p>
                                  <p className="text-xs text-muted-foreground">
                                    {trend.insights.peakUsageDate}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Least Active Day */}
                            {trend.insights.leastActiveDay && (
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-medium">Least Active</p>
                                  <p className="text-xs text-muted-foreground">
                                    {trend.insights.leastActiveDay}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {trend.data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={trend.data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                              dataKey="date" 
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
                            <Line 
                              type="monotone" 
                              dataKey="usage" 
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No usage data in selected time period
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {/* Combined Comparison Chart */}
                  {selectedPresetForTrend.length > 1 && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-medium text-sm mb-3">Combined Comparison</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date"
                            type="category"
                            allowDuplicatedCategory={false}
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
                          <Legend />
                          {analyticsData.individualPresetTrends.map((trend, index) => (
                            <Line
                              key={trend.presetId}
                              data={trend.data}
                              type="monotone"
                              dataKey="usage"
                              name={trend.presetName}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select presets to view trends</p>
                  <p className="text-sm mt-1">Choose up to 5 presets from the list above to compare their usage patterns over time.</p>
                </div>
              )}
            </div>

            {/* Usage Trend Over Time */}
            {analyticsData.usageTrend && analyticsData.usageTrend.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Usage Trend Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.usageTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

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
            <Button variant="outline" onClick={handleExportAnalytics}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button onClick={() => setAnalyticsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Recommendations Dialog */}
      <Dialog open={recommendationsOpen} onOpenChange={setRecommendationsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Preset Recommendations
            </DialogTitle>
            <DialogDescription>
              Intelligent suggestions to optimize your filter preset library based on usage patterns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isLoadingRecommendations ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Analyzing your preset usage patterns...</p>
              </div>
            ) : recommendations?.recommendations ? (
              <>
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      {recommendations.recommendations.length} optimization {recommendations.recommendations.length === 1 ? 'suggestion' : 'suggestions'} found
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {recommendations.recommendations.map((rec: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getActionColor(rec.action)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getActionIcon(rec.action)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold capitalize">
                              {rec.action} {rec.action === 'combine' ? 'Presets' : 'Preset'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={rec.priority === 'high' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {rec.priority} priority
                              </Badge>
                              <Button
                                size="sm"
                                variant={rec.action === 'delete' ? 'destructive' : 'default'}
                                onClick={() => handleApplyRecommendation(rec)}
                                className="h-7 text-xs"
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {rec.presetNames.map((name: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 These recommendations are generated by AI based on your usage patterns. 
                    Review each suggestion carefully before taking action.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recommendations available.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleGetRecommendations}
              disabled={isLoadingRecommendations}
            >
              Refresh
            </Button>
            <Button onClick={() => setRecommendationsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
