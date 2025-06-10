
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface AssetSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AssetSearchAndFilters: React.FC<AssetSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>
      <Button variant="outline" className="rounded-2xl">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </div>
  );
};
