import React from 'react';
import { LocationList } from '@/components/locations/LocationList';

const Locations: React.FC = () => {
  return (
    <div className="p-6">
      <LocationList />
    </div>
  );
};

export default Locations;