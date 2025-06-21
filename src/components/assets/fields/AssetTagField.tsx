
import React, { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { AssetTagModal } from '../AssetTagModal';
import type { AssetFormData } from '../types';

interface AssetTagFieldProps {
  control: Control<AssetFormData>;
  onTagSelect: (tag: string) => void;
}

export const AssetTagField: React.FC<AssetTagFieldProps> = ({ control, onTagSelect }) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  const assetTagValue = useWatch({
    control,
    name: 'asset_tag',
  });

  return (
    <FormField
      control={control}
      name="asset_tag"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Asset Tag</FormLabel>
          <div className="flex space-x-2">
            <FormControl>
              <Input 
                placeholder="Enter or select asset tag" 
                {...field}
                className="flex-1"
              />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTagModalOpen(true)}
              className="px-3"
            >
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage />
          
          <AssetTagModal
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
            onTagSelect={(tag) => {
              field.onChange(tag);
              onTagSelect(tag);
            }}
            currentTag={assetTagValue}
          />
        </FormItem>
      )}
    />
  );
};
