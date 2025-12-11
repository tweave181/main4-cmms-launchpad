import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SetupItem as SetupItemType } from '@/hooks/useTenantSetupStatus';

interface SetupItemProps {
  item: SetupItemType;
  showAction?: boolean;
  isAutoConfigured?: boolean;
}

export const SetupItem: React.FC<SetupItemProps> = ({ item, showAction = true, isAutoConfigured = false }) => {
  // For auto-configured items, only show View link (no action button for incomplete)
  const showViewOnly = isAutoConfigured;
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-3 px-4 rounded-lg transition-colors",
        item.isComplete 
          ? "bg-muted/30" 
          : "bg-muted/50 hover:bg-muted/70"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full",
            item.isComplete 
              ? "bg-green-500/20 text-green-600" 
              : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {item.isComplete ? (
            <Check className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className={cn(
            "font-medium text-sm",
            item.isComplete ? "text-muted-foreground" : "text-foreground"
          )}>
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
      
      {/* For auto-configured items, always show View link */}
      {showAction && item.link && showViewOnly && (
        <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
          <Link to={item.link}>
            {item.linkText || 'View'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      )}
      
      {/* For regular items: show action button when incomplete */}
      {showAction && item.link && !showViewOnly && !item.isComplete && (
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to={item.link}>
            {item.linkText || 'Configure'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      )}
      
      {/* For regular items: show View link when complete */}
      {showAction && item.link && !showViewOnly && item.isComplete && (
        <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
          <Link to={item.link}>
            View
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      )}
    </div>
  );
};
