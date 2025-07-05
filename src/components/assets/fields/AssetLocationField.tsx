
import React from 'react';
import { Control } from 'react-hook-form';
import { LocationSelector } from '@/components/locations/LocationSelector';
import type { AssetFormData } from '../types';

interface AssetLocationFieldProps {
  control: Control<AssetFormData>;
}

export const AssetLocationField: React.FC<AssetLocationFieldProps> = ({ control }) => {
  return (
    <LocationSelector
      control={control}
      name="location_id"
      label="Location"
      placeholder="Select location"
    />
  );
};
