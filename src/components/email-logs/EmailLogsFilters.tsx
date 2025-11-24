import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface EmailLogsFiltersProps {
  status: string;
  templateType: string;
  search: string;
  startDate: string;
  endDate: string;
  onStatusChange: (value: string) => void;
  onTemplateTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

export const EmailLogsFilters: React.FC<EmailLogsFiltersProps> = ({
  status,
  templateType,
  search,
  startDate,
  endDate,
  onStatusChange,
  onTemplateTypeChange,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or subject..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={templateType} onValueChange={onTemplateTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low_stock_alert">Low Stock Alert</SelectItem>
            <SelectItem value="contract_reminder">Contract Reminder</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="password_reset">Password Reset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-[160px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
