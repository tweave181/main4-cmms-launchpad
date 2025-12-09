import React from 'react';
import { Progress } from '@/components/ui/progress';

interface SetupProgressCardProps {
  tenantName: string;
  businessType: string | null;
  percentComplete: number;
  completedItems: number;
  totalItems: number;
}

export const SetupProgressCard: React.FC<SetupProgressCardProps> = ({
  tenantName,
  businessType,
  percentComplete,
  completedItems,
  totalItems,
}) => {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to Main4!
          </h1>
          <p className="text-muted-foreground mt-1">
            Let's get <span className="font-medium text-foreground">{tenantName}</span> set up
            {businessType && (
              <span className="text-xs ml-2 bg-muted px-2 py-0.5 rounded-full">
                {businessType}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-primary">{percentComplete}%</span>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </div>
      
      <Progress value={percentComplete} className="h-2 mb-2" />
      
      <p className="text-xs text-muted-foreground">
        {completedItems} of {totalItems} setup tasks completed
      </p>
    </div>
  );
};
