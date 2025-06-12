
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
  stockFilter,
  onStockFilterChange,
  onCreatePart,
  categories,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search parts by name, SKU, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full sm:w-40 rounded-2xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={onStockFilterChange}>
          <SelectTrigger className="w-full sm:w-32 rounded-2xl">
            <SelectValue placeholder="Stock Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="rounded-2xl">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>

        <Button onClick={onCreatePart} className="rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Button>
      </div>
    </div>
  );
};
