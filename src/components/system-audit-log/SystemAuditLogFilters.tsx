
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { useUsers } from '@/hooks/queries/useUsers';
import type { AuditLogFilters } from '@/pages/SystemAuditLog';

interface SystemAuditLogFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

export const SystemAuditLogFilters: React.FC<SystemAuditLogFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { data: users = [] } = useUsers();

  const entityTypes = ['Asset Prefix', 'Department', 'Job Title', 'Address'];

  const handleEntityTypeChange = (entityType: string, checked: boolean) => {
    const newEntityTypes = checked
      ? [...filters.entityTypes, entityType]
      : filters.entityTypes.filter(type => type !== entityType);
    
    onFiltersChange({ ...filters, entityTypes: newEntityTypes });
  };

  const handleUserChange = (userId: string) => {
    onFiltersChange({ ...filters, userId: userId === 'all' ? undefined : userId });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ 
      ...filters, 
      [field]: value ? new Date(value) : undefined 
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      entityTypes: ['Asset Prefix', 'Department', 'Job Title', 'Address'],
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Entity Types */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Entity Types</Label>
            <div className="space-y-2">
              {entityTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.entityTypes.includes(type)}
                    onCheckedChange={(checked) => 
                      handleEntityTypeChange(type, checked === true)
                    }
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label htmlFor="user-select" className="text-sm font-medium">User</Label>
            <Select onValueChange={handleUserChange} value={filters.userId || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
