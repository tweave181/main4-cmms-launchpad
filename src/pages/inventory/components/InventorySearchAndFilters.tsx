import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, X } from 'lucide-react';

interface InventorySearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  inventoryTypeFilter: string;
  onInventoryTypeFilterChange: (value: string) => void;
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
  onCreatePart: () => void;
  onClearFilters: () => void;
  categories: string[];
  searchInputRef?: React.RefObject<HTMLInputElement>;
  categorySelectRef?: React.RefObject<HTMLButtonElement>;
  inventoryTypeSelectRef?: React.RefObject<HTMLButtonElement>;
  stockSelectRef?: React.RefObject<HTMLButtonElement>;
}

export const InventorySearchAndFilters = forwardRef<HTMLInputElement, InventorySearchAndFiltersProps>(({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  inventoryTypeFilter,
  onInventoryTypeFilterChange,
  stockFilter,
  onStockFilterChange,
  onCreatePart,
  onClearFilters,
  categories,
  searchInputRef,
  categorySelectRef,
  inventoryTypeSelectRef,
  stockSelectRef,
}, ref) => {
  const hasActiveFilters = 
    searchTerm !== '' || 
    categoryFilter !== 'all' || 
    inventoryTypeFilter !== 'all' || 
    stockFilter !== 'all';

  return <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Inventory Parts List</h2>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button onClick={onClearFilters} variant="outline" className="whitespace-nowrap">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
          <Button onClick={onCreatePart} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory Part
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input 
            ref={searchInputRef || ref} 
            placeholder="Search parts by name, SKU, or description..." 
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
          />
          {searchTerm && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 flex items-center justify-center"
            >
              1
            </Badge>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Select value={inventoryTypeFilter} onValueChange={onInventoryTypeFilterChange}>
              <SelectTrigger ref={inventoryTypeSelectRef} className="w-[180px]">
                <SelectValue placeholder="Inventory Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="spare_parts">Spare Parts</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
              </SelectContent>
            </Select>
            {inventoryTypeFilter !== 'all' && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 flex items-center justify-center"
              >
                1
              </Badge>
            )}
          </div>

          <div className="relative">
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger ref={categorySelectRef} className="w-[200px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {categoryFilter !== 'all' && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 flex items-center justify-center"
              >
                1
              </Badge>
            )}
          </div>
          
          <div className="relative">
            <Select value={stockFilter} onValueChange={onStockFilterChange}>
              <SelectTrigger ref={stockSelectRef} className="w-[150px]">
                <SelectValue placeholder="Stock Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {stockFilter !== 'all' && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 flex items-center justify-center"
              >
                1
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>;
});