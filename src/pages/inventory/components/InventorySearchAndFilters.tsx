import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
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
  categories: string[];
}
export const InventorySearchAndFilters: React.FC<InventorySearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  inventoryTypeFilter,
  onInventoryTypeFilterChange,
  stockFilter,
  onStockFilterChange,
  onCreatePart,
  categories
}) => {
  return <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Inventory Parts List</h2>
        <Button onClick={onCreatePart} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory Part
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search parts by name, SKU, or description..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} />
        </div>
        
        <div className="flex gap-4">
          <Select value={inventoryTypeFilter} onValueChange={onInventoryTypeFilterChange}>
            <SelectTrigger className="w-[180px]">
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

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Stock Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>;
};