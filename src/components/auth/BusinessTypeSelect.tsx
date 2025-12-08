import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroupedBusinessTypes } from '@/hooks/useBusinessTypes';
import { Loader2 } from 'lucide-react';

interface BusinessTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const BusinessTypeSelect: React.FC<BusinessTypeSelectProps> = ({ value, onChange }) => {
  const { data: groupedTypes, isLoading } = useGroupedBusinessTypes();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Business Type</Label>
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="businessType">Business Type</Label>
      <Select value={value} onValueChange={onChange} required>
        <SelectTrigger id="businessType">
          <SelectValue placeholder="Select your business type" />
        </SelectTrigger>
        <SelectContent>
          {groupedTypes?.map((group) => (
            <SelectGroup key={group.category}>
              <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.category}
              </SelectLabel>
              {group.types.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BusinessTypeSelect;
