
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const PMCalendarView: React.FC = () => {
  const { userProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: schedules = [] } = useQuery({
    queryKey: ['pm-schedules-calendar', format(currentDate, 'yyyy-MM')],
    queryFn: async (): Promise<PMScheduleWithAssets[]> => {
      console.log('Fetching PM schedules for calendar...');
      
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const { data, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select(`
          *,
          pm_schedule_assets!inner(
            asset_id,
            assets(
              id,
              name,
              asset_tag
            )
          )
        `)
        .eq('tenant_id', userProfile?.tenant_id)
        .eq('is_active', true)
        .gte('next_due_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('next_due_date', format(monthEnd, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching PM schedules for calendar:', error);
        throw error;
      }

      console.log('PM schedules for calendar fetched:', data);
      
      // Transform the data to include assets array
      const transformedData = data.map(schedule => ({
        ...schedule,
        assets: schedule.pm_schedule_assets?.map(psa => psa.assets).filter(Boolean) || []
      }));

      return transformedData;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.next_due_date), day)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>{format(currentDate, 'MMMM yyyy')}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const daySchedules = getSchedulesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] p-2 border rounded-lg
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                  ${isToday ? 'ring-2 ring-primary ring-opacity-50' : ''}
                  hover:bg-gray-50 transition-colors
                `}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-1 rounded text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                      title={`${schedule.name} - ${schedule.assets?.length || 0} assets`}
                    >
                      <div className="font-medium truncate">
                        {schedule.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {schedule.assets?.length || 0} assets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {schedules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No maintenance scheduled for {format(currentDate, 'MMMM yyyy')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
