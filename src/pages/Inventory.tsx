
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Boxes, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventoryParts } from './inventory/hooks/useInventoryParts';
import { InventorySearchAndFilters } from './inventory/components/InventorySearchAndFilters';
import { InventoryPartTable } from './inventory/components/InventoryPartTable';
import { InventoryEmptyState } from './inventory/components/InventoryEmptyState';
import { InventoryValueBreakdown } from './inventory/components/InventoryValueBreakdown';
import { CreatePartModal } from './inventory/components/CreatePartModal';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

const FILTER_STORAGE_KEY = 'inventory-filters';

const Inventory: React.FC = () => {
  // Load initial filter state from localStorage
  const loadFilters = () => {
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if there are any active filters
        const hasActiveFilters = 
          parsed.searchTerm !== '' || 
          parsed.categoryFilter !== 'all' || 
          parsed.stockFilter !== 'all' || 
          parsed.inventoryTypeFilter !== 'all';
        return { filters: parsed, wasLoaded: hasActiveFilters };
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
    }
    return {
      filters: {
        searchTerm: '',
        categoryFilter: 'all',
        stockFilter: 'all',
        inventoryTypeFilter: 'all',
      },
      wasLoaded: false,
    };
  };

  const { filters: initialFilters, wasLoaded } = loadFilters();
  
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.categoryFilter);
  const [stockFilter, setStockFilter] = useState(initialFilters.stockFilter);
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState(initialFilters.inventoryTypeFilter);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(wasLoaded);
  const { toast } = useToast();

  // Hide saved indicator after 3 seconds
  useEffect(() => {
    if (showSavedIndicator) {
      const timer = setTimeout(() => {
        setShowSavedIndicator(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedIndicator]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchTerm,
      categoryFilter,
      stockFilter,
      inventoryTypeFilter,
    };
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }, [searchTerm, categoryFilter, stockFilter, inventoryTypeFilter]);

  const {
    parts,
    isLoading,
    createPart,
    updatePart,
    deletePart,
    isCreating,
  } = useInventoryParts();

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      parts.filter(part => part.category).map(part => part.category!)
    );
    return Array.from(uniqueCategories).sort();
  }, [parts]);

  // Filter parts based on search and filters
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      // Search filter
      const matchesSearch = !searchTerm || 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.description && part.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

      // Inventory type filter
      const matchesInventoryType = inventoryTypeFilter === 'all' || (part as any).inventory_type === inventoryTypeFilter;

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = part.quantity_in_stock <= part.reorder_threshold && part.quantity_in_stock > 0;
      } else if (stockFilter === 'out') {
        matchesStock = part.quantity_in_stock === 0;
      } else if (stockFilter === 'in-stock') {
        matchesStock = part.quantity_in_stock > part.reorder_threshold;
      }

      return matchesSearch && matchesCategory && matchesInventoryType && matchesStock;
    });
  }, [parts, searchTerm, categoryFilter, inventoryTypeFilter, stockFilter]);

  const handleViewPart = (part: InventoryPart) => {
    console.log('View part:', part);
    // TODO: Implement part detail view
  };

  const handleEditPart = (part: InventoryPart) => {
    console.log('Edit part:', part);
    // TODO: Implement edit functionality
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setInventoryTypeFilter('all');
    
    // Clear saved filters from localStorage
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear filters from localStorage:', error);
    }
    
    toast({
      title: 'Filters Reset',
      description: 'All filters have been reset to default settings.',
    });
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (categoryFilter !== 'all') count++;
    if (stockFilter !== 'all') count++;
    if (inventoryTypeFilter !== 'all') count++;
    return count;
  }, [searchTerm, categoryFilter, stockFilter, inventoryTypeFilter]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Boxes className="h-6 w-6 text-primary" />
              <span>Inventory</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading inventory...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <Boxes className="h-6 w-6 text-primary" />
            <span>Inventory</span>
            {showSavedIndicator && (
              <Badge 
                variant="outline" 
                className="ml-2 animate-fade-in flex items-center gap-1 text-green-600 border-green-600"
              >
                <Check className="h-3 w-3" />
                Saved filters applied
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1 hover-scale"
                onClick={handleClearFilters}
                title="Click to clear all filters"
              >
                {activeFiltersCount} {activeFiltersCount === 1 ? 'Filter' : 'Filters'} Active
                <X className="h-3 w-3" />
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InventorySearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            inventoryTypeFilter={inventoryTypeFilter}
            onInventoryTypeFilterChange={setInventoryTypeFilter}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            onCreatePart={() => setCreateModalOpen(true)}
            onClearFilters={handleClearFilters}
            categories={categories}
          />

          <InventoryValueBreakdown 
            parts={filteredParts} 
            currentFilter={inventoryTypeFilter}
            onFilterChange={setInventoryTypeFilter}
          />

          {filteredParts.length === 0 ? (
            <InventoryEmptyState
              searchTerm={searchTerm}
              onCreatePart={() => setCreateModalOpen(true)}
            />
          ) : (
            <InventoryPartTable
              parts={filteredParts}
              onDeletePart={deletePart}
            />
          )}
        </CardContent>
      </Card>

      <CreatePartModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreatePart={async (data) => {
          await createPart(data);
        }}
        isCreating={isCreating}
      />
    </div>
  );
};

export default Inventory;
