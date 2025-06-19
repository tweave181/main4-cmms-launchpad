
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
}

interface AssetTagPrefixSelectorProps {
  prefixes: AssetTagPrefix[];
  onPrefixChange: (prefixId: string) => void;
}

export const AssetTagPrefixSelector: React.FC<AssetTagPrefixSelectorProps> = ({
  prefixes,
  onPrefixChange,
}) => {
  return (
    <div>
      <Label htmlFor="prefix-select">Asset Type Prefix</Label>
      <Select onValueChange={onPrefixChange}>
        <SelectTrigger id="prefix-select">
          <SelectValue placeholder="Select asset type" />
        </SelectTrigger>
        <SelectContent>
          {prefixes.map((prefix) => (
            <SelectItem key={prefix.id} value={prefix.id}>
              {prefix.prefix_letter}{parseInt(prefix.number_code)} - {prefix.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
