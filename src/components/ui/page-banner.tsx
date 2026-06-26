import React from 'react';
import { cn } from '@/lib/utils';

import dashboardImg from '@/assets/banners/banner-dashboard.jpg';
import assetsImg from '@/assets/banners/banner-assets.jpg';
import maintenanceImg from '@/assets/banners/banner-maintenance.jpg';
import inventoryImg from '@/assets/banners/banner-inventory.jpg';
import workordersImg from '@/assets/banners/banner-workorders.jpg';
import contractsImg from '@/assets/banners/banner-contracts.jpg';
import defaultImg from '@/assets/banners/banner-default.jpg';

export type PageBannerVariant =
  | 'dashboard'
  | 'assets'
  | 'maintenance'
  | 'inventory'
  | 'workorders'
  | 'contracts'
  | 'default';

const VARIANT_IMG: Record<PageBannerVariant, string> = {
  dashboard: dashboardImg,
  assets: assetsImg,
  maintenance: maintenanceImg,
  inventory: inventoryImg,
  workorders: workordersImg,
  contracts: contractsImg,
  default: defaultImg,
};

interface PageBannerProps {
  variant?: PageBannerVariant;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /** Height in tailwind classes. Defaults to a compact banner. */
  heightClass?: string;
}

/**
 * Engineering-themed hero banner for top of pages.
 * Renders an image background with a gradient overlay, page title, optional
 * subtitle and right-aligned actions.
 */
export const PageBanner: React.FC<PageBannerProps> = ({
  variant = 'default',
  title,
  subtitle,
  icon,
  actions,
  className,
  heightClass = 'h-40 md:h-48',
}) => {
  const img = VARIANT_IMG[variant] ?? defaultImg;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl shadow-sm border border-border mb-6',
        heightClass,
        className,
      )}
    >
      <img
        src={img}
        alt=""
        aria-hidden="true"
        width={1920}
        height={512}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay for legible text */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />

      <div className="relative z-10 flex h-full items-center justify-between gap-4 px-6 md:px-8">
        <div className="flex items-center gap-4 min-w-0">
          {icon && (
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary backdrop-blur-sm border border-primary/20">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-muted-foreground line-clamp-2 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
