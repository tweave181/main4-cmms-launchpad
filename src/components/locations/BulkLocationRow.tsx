import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkLocationData {
  id: string;
  name: string;
  location_code: string;
  location_level_id: string;
  department_id: string;
  description: string;
}

interface LocationLevel {
  id: string;
  name: string;
  code: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface BulkLocationRowProps {
  index: number;
  data: BulkLocationData;
  locationLevels: LocationLevel[];
  departments: Department[];
  onChange: (id: string, field: keyof BulkLocationData, value: string) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof BulkLocationData, boolean>>;
}

export const BulkLocationRow: React.FC<BulkLocationRowProps> = ({
  index,
  data,
  locationLevels,
  departments,
  onChange,
  onRemove,
  errors = {},
}) => {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30">
      <td className="p-2 text-center text-sm text-muted-foreground w-10">
        {index + 1}
      </td>
      <td className="p-2">
        <Input
          value={data.name}
          onChange={(e) => onChange(data.id, 'name', e.target.value)}
          placeholder="Location name"
          className={cn("h-9", errors.name && "border-destructive")}
        />
      </td>
      <td className="p-2">
        <Input
          value={data.location_code}
          onChange={(e) => onChange(data.id, 'location_code', e.target.value.toUpperCase())}
          placeholder="CODE"
          className={cn("h-9 font-mono", errors.location_code && "border-destructive")}
        />
      </td>
      <td className="p-2">
        <Select
          value={data.location_level_id}
          onValueChange={(value) => onChange(data.id, 'location_level_id', value)}
        >
          <SelectTrigger className={cn("h-9", errors.location_level_id && "border-destructive")}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {locationLevels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Select
          value={data.department_id}
          onValueChange={(value) => onChange(data.id, 'department_id', value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Input
          value={data.description}
          onChange={(e) => onChange(data.id, 'description', e.target.value)}
          placeholder="Optional description"
          className="h-9"
        />
      </td>
      <td className="p-2 w-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(data.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};
