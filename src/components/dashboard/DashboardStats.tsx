
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Calendar } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useNavigate } from 'react-router-dom';

export const DashboardStats: React.FC = () => {
  const { openWorkOrders, overdueScheduledTasks, dueTodayScheduledTasks } = useDashboardStats();
  const navigate = useNavigate();
  
  const totalScheduledTasks = overdueScheduledTasks + dueTodayScheduledTasks;

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold">Dashboard Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors"
            onClick={() => navigate('/work-orders')}
          >
            <div className="flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-primary" />
              <span className="text-base font-medium text-gray-700">Open Work Orders</span>
            </div>
            <span className="font-semibold text-lg">{openWorkOrders}</span>
          </div>
          
          <div 
            className="flex flex-col cursor-pointer hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors"
            onClick={() => navigate('/maintenance')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                <span className="text-base font-medium text-gray-700">Open Scheduled Tasks</span>
              </div>
              <span className="font-semibold text-lg">{totalScheduledTasks}</span>
            </div>
            {totalScheduledTasks > 0 && (
              <div className="ml-7 mt-1 text-sm text-muted-foreground">
                {overdueScheduledTasks > 0 && (
                  <span className="text-destructive font-medium">{overdueScheduledTasks} overdue</span>
                )}
                {overdueScheduledTasks > 0 && dueTodayScheduledTasks > 0 && <span> • </span>}
                {dueTodayScheduledTasks > 0 && (
                  <span className="text-amber-600 font-medium">{dueTodayScheduledTasks} due today</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
