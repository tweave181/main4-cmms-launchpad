
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
  const addressParts = [
    companyName,
    address?.line1,
    address?.line2,
    address?.line3,
    address?.town_city,
    address?.county_state,
    address?.postcode,
    address?.country,
  ].filter(Boolean) as string[];

  const fullAddress = addressParts.join(', ');
  const fullAddressForCopy = [companyName, ...addressParts.slice(1)].filter(Boolean).join('\n');

  function openInMaps(query: string) {
    if (!query) return;
    const encoded = encodeURIComponent(query);
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/.test(ua);

    // Use native Apple Maps app on iOS, Google Maps everywhere else
    const url = isIOS
      ? `maps://?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;

    // Direct navigation - more reliable than window.open
    window.location.assign(url);
  }

  const canMap = !!(address?.line1 || address?.town_city || address?.postcode || address?.country);

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
        {canMap && (
          <button
            onClick={() => openInMaps(fullAddress)}
            className="hover:text-slate-700 flex items-center gap-1"
            aria-label="Open this address in Maps"
            data-testid="open-in-maps"
          >
            <MapPin className="h-3 w-3" />
            Open in Maps
          </button>
        )}
      </div>
    </div>
  );
}
