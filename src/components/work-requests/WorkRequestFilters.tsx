import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkRequestCategories } from '@/hooks/useWorkRequests';
import { WorkRequestFilters as FilterType } from '@/types/workRequest';

interface WorkRequestFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const WorkRequestFilters: React.FC<WorkRequestFiltersProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const { data: categories = [] } = useWorkRequestCategories();
  
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(v) => onFiltersChange({ ...filters, status: v as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Category:</span>
        <Select 
          value={filters.category || 'all'} 
          onValueChange={(v) => onFiltersChange({ ...filters, category: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
