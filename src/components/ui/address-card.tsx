import React from 'react';
import { Copy, MapPin } from 'lucide-react';

type AddressCardProps = {
  companyName?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
    town_city?: string | null;
    county_state?: string | null;
    postcode?: string | null;
    country?: string | null;
  };
  className?: string;
};

export function AddressCard({ companyName, address, className }: AddressCardProps) {
  const lines = [
    address?.line1,
    address?.line2,
    address?.line3,
    address?.town_city,
    address?.county_state,
    address?.postcode,
    address?.country,
  ].filter(Boolean) as string[];

  const fullAddress = [companyName, ...lines].filter(Boolean).join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleMapClick = () => {
    const searchQuery = [
      address?.postcode,
      address?.town_city,
      address?.county_state,
      address?.country
    ].filter(Boolean).join(', ');
    
    if (searchQuery) {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const hasMapData = address?.postcode || address?.country;

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${className ?? ''}`}>
      <div className="bg-blue-600 text-white px-4 py-2" role="heading" aria-level={3}>
        <div className="font-semibold truncate">
          {companyName || '—'}
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3">
        {lines.length === 0 ? (
          <div className="text-slate-500 italic">No address on file</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {lines.map((line, idx) => (
              <li key={idx} className="py-2 leading-6 text-slate-800 break-words">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="px-4 py-2 flex items-center justify-end gap-3 text-sm text-slate-500">
        <button 
          onClick={handleCopy} 
          className="hover:text-slate-700 flex items-center gap-1"
          title="Copy address"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
        {hasMapData && (
          <button 
            onClick={handleMapClick} 
            className="hover:text-slate-700 flex items-center gap-1"
            title="View on map"
          >
            <MapPin className="h-3 w-3" />
            Map
          </button>
        )}
      </div>
    </div>
  );
}