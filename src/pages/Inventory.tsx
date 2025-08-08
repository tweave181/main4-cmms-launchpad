
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes } from 'lucide-react';
import { useInventoryParts } from './inventory/hooks/useInventoryParts';
import { InventorySearchAndFilters } from './inventory/components/InventorySearchAndFilters';
import { InventoryPartTable } from './inventory/components/InventoryPartTable';
import { InventoryEmptyState } from './inventory/components/InventoryEmptyState';
import { CreatePartModal } from './inventory/components/CreatePartModal';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = part.quantity_in_stock <= part.reorder_threshold && part.quantity_in_stock > 0;
      } else if (stockFilter === 'out') {
        matchesStock = part.quantity_in_stock === 0;
      } else if (stockFilter === 'in-stock') {
        matchesStock = part.quantity_in_stock > part.reorder_threshold;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [parts, searchTerm, categoryFilter, stockFilter]);

  const handleViewPart = (part: InventoryPart) => {
    console.log('View part:', part);
    // TODO: Implement part detail view
  };

  const handleEditPart = (part: InventoryPart) => {
    console.log('Edit part:', part);
    // TODO: Implement edit functionality
  };

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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InventorySearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            onCreatePart={() => setCreateModalOpen(true)}
            categories={categories}
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
