import React from 'react';
import { useProgramSettings } from '@/hooks/useProgramSettings';

interface PageBannerProps {
  title: string;
  customerLogoUrl?: string;
  showMain4Logo?: boolean;
  className?: string;
}

export const PageBanner: React.FC<PageBannerProps> = ({
  title,
  customerLogoUrl,
  showMain4Logo = true,
  className = ''
}) => {
  const { data: settings } = useProgramSettings();
  
  // Use provided customerLogoUrl or fall back to settings
  const logoUrl = customerLogoUrl || settings?.logo_url;

  return (
    <div className={`w-full bg-card border-b border-border py-4 px-6 ${className}`}>
      <div className="flex items-center justify-between max-w-full">
        {/* Left Section - Customer Logo */}
        <div className="flex-1 flex justify-start">
          <div className="w-32 h-12 flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Customer Logo"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                Customer Logo
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Page Title */}
        <div className="flex-1 flex justify-center px-4">
          <h1 className="text-xl font-bold text-foreground text-center">
            {title}
          </h1>
        </div>

        {/* Right Section - Main4 Logo */}
        <div className="flex-1 flex justify-end">
          {showMain4Logo && (
            <div className="w-32 h-12 flex items-center justify-end">
              <img
                src="/main4-logo.png"
                alt="Main4 Logo"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden bg-primary text-primary-foreground px-3 py-1 rounded font-bold text-sm">
                Main4
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};