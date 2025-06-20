
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
  asset_count?: number;
  is_at_capacity?: boolean;
}

interface AssetTagPrefixSelectorProps {
  prefixes: AssetTagPrefix[];
  onPrefixChange: (prefixId: string) => void;
}

export const AssetTagPrefixSelector: React.FC<AssetTagPrefixSelectorProps> = ({
  prefixes,
  onPrefixChange,
}) => {
  // Filter out prefixes that are at capacity
  const availablePrefixes = prefixes.filter(prefix => !prefix.is_at_capacity);
  const hasUnavailablePrefixes = prefixes.length > availablePrefixes.length;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="prefix-select">Asset Type Prefix</Label>
        <Select onValueChange={onPrefixChange}>
          <SelectTrigger id="prefix-select">
            <SelectValue placeholder="Select asset type" />
          </SelectTrigger>
          <SelectContent>
            {availablePrefixes.map((prefix) => (
              <SelectItem key={prefix.id} value={prefix.id}>
                {prefix.prefix_letter}{parseInt(prefix.number_code)} - {prefix.description}
                {prefix.asset_count !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({prefix.asset_count}/999 used)
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasUnavailablePrefixes && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some prefixes are at capacity and cannot be used. Please contact an administrator to add new prefixes if needed.
          </AlertDescription>
        </Alert>
      )}

      {availablePrefixes.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All available prefixes are at capacity. Please contact an administrator to add new prefixes before creating assets.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
