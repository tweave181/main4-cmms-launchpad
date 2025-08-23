
import React, { useState } from 'react';
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
  const [showMap, setShowMap] = useState(false);
  
  const parts = [
    companyName,
    address?.line1,
    address?.line2,
    address?.line3,
    address?.town_city,
    address?.county_state,
    address?.postcode,
    address?.country,
  ].filter(Boolean) as string[];

  const fullAddress = parts.join(', ');
  const fullAddressForCopy = [companyName, ...parts.slice(1)].filter(Boolean).join('\n');
  const mapQuery = encodeURIComponent(fullAddress);
  const mapEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const hasMappable = Boolean(address?.line1 || address?.town_city || address?.postcode || address?.country);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddressForCopy);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Only show non-company address lines in the card body
  const displayLines = [
    address?.line1,
    address?.line2,
    address?.line3,
    address?.town_city,
    address?.county_state,
    address?.postcode,
    address?.country,
  ].filter(Boolean) as string[];

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${className ?? ''}`}>
      <div className="bg-blue-600 text-white px-4 py-2" role="heading" aria-level={3}>
        <div className="font-semibold truncate">
          {companyName || '—'}
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3">
        {displayLines.length === 0 ? (
          <div className="text-slate-500 italic">No address on file</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {displayLines.map((line, idx) => (
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
          aria-label="Copy full address to clipboard"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
        {hasMappable && (
          <button
            onClick={() => setShowMap(v => !v)}
            className="hover:text-slate-700 flex items-center gap-1"
            aria-expanded={showMap}
          >
            <MapPin className="h-3 w-3" />
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        )}
      </div>
      {showMap && hasMappable && (
        <div className="px-4 pb-4">
          <div className="rounded-lg overflow-hidden border bg-white">
            <iframe
              title="Address map"
              src={mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
              style={{ height: 300, border: 0 }}
              onError={(e) => {
                // Replace iframe with a friendly fallback
                (e.currentTarget.parentElement as HTMLElement).innerHTML =
                  '<div class="p-4 text-sm text-slate-600">Map preview unavailable for this address.</div>';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
