import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  content: React.ReactNode;
}

interface ReusableTabsProps {
  tabs: TabItem[];
  defaultValue: string;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const ReusableTabs: React.FC<ReusableTabsProps> = ({
  tabs,
  defaultValue,
  className,
  value,
  onValueChange,
}) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <div className="mb-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-background/50"
            >
              {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};