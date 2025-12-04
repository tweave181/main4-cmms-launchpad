import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, Tag, Wrench } from 'lucide-react';
import { PlatformStats } from '@/hooks/useSystemAdminStats';

interface TenantOverviewCardsProps {
  stats: PlatformStats | undefined;
  isLoading: boolean;
}

export const TenantOverviewCards = ({ stats, isLoading }: TenantOverviewCardsProps) => {
  const cards = [
    {
      title: 'Tenants',
      value: stats?.totalTenants || 0,
      description: 'Platform',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      title: 'Users',
      value: stats?.totalUsers || 0,
      description: 'Total Active',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Assets',
      value: stats?.totalAssets || 0,
      description: 'Total Tracked',
      icon: Tag,
      color: 'text-purple-500'
    },
    {
      title: 'Work Orders',
      value: stats?.totalWorkOrders || 0,
      description: 'Total Created',
      icon: Wrench,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : card.value}
                </p>
                <p className="text-sm font-medium">{card.title}</p>
              </div>
              <card.icon className={`h-10 w-10 ${card.color} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
