
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SortAsc, SortDesc } from 'lucide-react';

interface JobTitleSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (value: 'asc' | 'desc') => void;
}

export const JobTitleSearchAndFilters: React.FC<JobTitleSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search job titles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
        <Select value={sortOrder} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 rounded-2xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg rounded-lg z-50">
            <SelectItem value="asc" className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              A to Z
            </SelectItem>
            <SelectItem value="desc" className="flex items-center gap-2">
              <SortDesc className="h-4 w-4" />
              Z to A
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
