import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface BulkAssetData {
  id: string;
  name: string;
  asset_tag: string;
  category_id: string;
  location_id: string;
  status: string;
  priority: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  location_code: string;
}

interface BulkAssetRowProps {
  index: number;
  data: BulkAssetData;
  categories: Category[];
  locations: Location[];
  onChange: (id: string, field: keyof BulkAssetData, value: string) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof BulkAssetData, boolean>>;
  isLoadingLocations?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Decommissioned', label: 'Decommissioned' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

export const BulkAssetRow: React.FC<BulkAssetRowProps> = ({
  index,
  data,
  categories,
  locations,
  onChange,
  onRemove,
  errors = {},
  isLoadingLocations = false,
}) => {
  return (
    <tr className="border-b border-border hover:bg-muted/30">
      <td className="p-2 text-sm text-muted-foreground">{index + 1}</td>
      <td className="p-2">
        <Input
          value={data.name}
          onChange={(e) => onChange(data.id, 'name', e.target.value)}
          placeholder="Asset name"
          className={errors.name ? 'border-destructive' : ''}
        />
      </td>
      <td className="p-2">
        <Input
          value={data.asset_tag}
          onChange={(e) => onChange(data.id, 'asset_tag', e.target.value)}
          placeholder="Tag (optional)"
          className="w-28"
        />
      </td>
      <td className="p-2">
        <Select
          value={data.category_id}
          onValueChange={(value) => onChange(data.id, 'category_id', value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Select
          value={data.location_id}
          onValueChange={(value) => onChange(data.id, 'location_id', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={isLoadingLocations ? 'Loading...' : 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name} ({loc.location_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Select
          value={data.status}
          onValueChange={(value) => onChange(data.id, 'status', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Select
          value={data.priority}
          onValueChange={(value) => onChange(data.id, 'priority', value)}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Input
          value={data.description}
          onChange={(e) => onChange(data.id, 'description', e.target.value)}
          placeholder="Description (optional)"
        />
      </td>
      <td className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(data.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};
