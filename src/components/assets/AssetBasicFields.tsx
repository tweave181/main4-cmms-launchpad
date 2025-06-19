import React, { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { AssetTagModal } from './AssetTagModal';
import type { AssetFormData } from './types';

interface AssetBasicFieldsProps {
  control: Control<AssetFormData>;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({ control }) => {
  const { departments } = useDepartments();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  // Watch the asset_tag field value
  const assetTagValue = useWatch({
    control,
    name: 'asset_tag',
  });

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asset Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter asset name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
              }}
              currentTag={assetTagValue}
            />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input placeholder="Enter category" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Enter location" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="department_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
