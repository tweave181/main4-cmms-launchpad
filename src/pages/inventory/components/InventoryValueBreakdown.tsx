import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Droplet, Wrench, Box, Layers } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Database } from '@/integrations/supabase/types';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

interface InventoryValueBreakdownProps {
  parts: InventoryPart[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const inventoryTypeConfig = {
  spare_parts: {
    label: 'Spare Parts',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  consumables: {
    label: 'Consumables',
    icon: Droplet,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  tools: {
    label: 'Tools',
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  supplies: {
    label: 'Supplies',
    icon: Box,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  materials: {
    label: 'Materials',
    icon: Layers,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
};

export const InventoryValueBreakdown: React.FC<InventoryValueBreakdownProps> = ({
  parts,
  currentFilter,
  onFilterChange,
}) => {
  const { formatCurrency } = useGlobalSettings();

  const breakdown = React.useMemo(() => {
    const valueByType = parts.reduce((acc, part) => {
      const type = (part as any).inventory_type || 'spare_parts';
      const unitCost = (part as any).unit_cost || 0;
      const quantity = part.quantity_in_stock || 0;
      const value = unitCost * quantity;

      if (!acc[type]) {
        acc[type] = { value: 0, count: 0 };
      }
      acc[type].value += value;
      acc[type].count += 1;

      return acc;
    }, {} as Record<string, { value: number; count: number }>);

    return Object.entries(valueByType).map(([type, data]) => ({
      type,
      ...data,
      config: inventoryTypeConfig[type as keyof typeof inventoryTypeConfig],
    }));
  }, [parts]);

  const totalValue = breakdown.reduce((sum, item) => sum + item.value, 0);

  if (breakdown.length === 0) return null;

  const handleCardClick = (type: string) => {
    // Toggle filter: if clicking the same type, reset to 'all', otherwise set to that type
    if (currentFilter === type) {
      onFilterChange('all');
    } else {
      onFilterChange(type);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Inventory Value by Type
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {breakdown.map((item) => {
          const Icon = item.config.icon;
          const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          const isActive = currentFilter === item.type;

          return (
            <Card 
              key={item.type} 
              className={`rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                isActive ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => handleCardClick(item.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${item.config.bgColor} ${
                    isActive ? 'ring-2 ring-primary/50' : ''
                  }`}>
                    <Icon className={`h-5 w-5 ${item.config.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.config.label}
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
