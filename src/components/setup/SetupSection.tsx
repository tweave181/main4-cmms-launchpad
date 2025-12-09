import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetupItem } from './SetupItem';
import type { SetupSection as SetupSectionType } from '@/hooks/useTenantSetupStatus';

interface SetupSectionProps {
  section: SetupSectionType;
  defaultOpen?: boolean;
}

export const SetupSection: React.FC<SetupSectionProps> = ({ 
  section, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const completedCount = section.items.filter(i => i.isComplete).length;
  const totalCount = section.items.length;
  const allComplete = completedCount === totalCount;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors",
          "hover:bg-muted/50",
          allComplete ? "bg-muted/30" : "bg-card"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{section.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-sm">{section.title}</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allComplete && (
            <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-3 space-y-2 bg-background">
          {section.items.map((item) => (
            <SetupItem 
              key={item.id} 
              item={item} 
              showAction={!section.isAutoConfigured}
            />
          ))}
        </div>
      )}
    </div>
  );
};
