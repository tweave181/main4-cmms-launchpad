
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { WorkOrderFilters } from '@/types/workOrder';

interface WorkOrderFiltersComponentProps {
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  onClearFilters: () => void;
}

export const WorkOrderFiltersComponent: React.FC<WorkOrderFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleStatusChange = (value: string) => {
    const newStatus = value === 'all' ? undefined : value as WorkOrderFilters['status'];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = value === 'all' ? undefined : value as WorkOrderFilters['priority'];
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handleWorkTypeChange = (value: string) => {
    const newWorkType = value === 'all' ? undefined : value as WorkOrderFilters['work_type'];
    onFiltersChange({ ...filters, work_type: newWorkType });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value || undefined;
    onFiltersChange({ ...filters, search });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.work_type || filters.search;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Work Type</label>
          <Select 
            value={filters.work_type || 'all'} 
            onValueChange={handleWorkTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All work types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Types</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <Input
            placeholder="Search work orders..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        </div>
      )}
    </div>
  );
};
