import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface BulkAssetData {
  id: string;
  name: string;
  prefix_id: string;
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

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
}

interface BulkAssetRowProps {
  index: number;
  data: BulkAssetData;
  categories: Category[];
  locations: Location[];
  prefixes: AssetTagPrefix[];
  onChange: (id: string, field: keyof BulkAssetData, value: string) => void;
  onPrefixChange: (id: string, prefixId: string) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof BulkAssetData, boolean>>;
  isLoadingLocations?: boolean;
  isLoadingPrefixes?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'disposed', label: 'Disposed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const BulkAssetRow: React.FC<BulkAssetRowProps> = ({
  index,
  data,
  categories,
  locations,
  prefixes,
  onChange,
  onPrefixChange,
  onRemove,
  errors = {},
  isLoadingLocations = false,
  isLoadingPrefixes = false,
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
        <Select
          value={data.prefix_id}
          onValueChange={(value) => onPrefixChange(data.id, value)}
        >
          <SelectTrigger className={`w-32 ${errors.asset_tag ? 'border-destructive' : ''}`}>
            <SelectValue placeholder={isLoadingPrefixes ? 'Loading...' : 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {prefixes.map((prefix) => (
              <SelectItem key={prefix.id} value={prefix.id}>
                {prefix.prefix_letter}{prefix.number_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <div className="px-3 py-2 text-sm bg-muted rounded-md min-w-[80px] font-mono">
          {data.asset_tag || '—'}
        </div>
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
