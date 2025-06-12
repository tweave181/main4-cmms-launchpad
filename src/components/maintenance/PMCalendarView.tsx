
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { usePMSchedules } from '@/hooks/usePreventiveMaintenance';
import { Skeleton } from '@/components/ui/skeleton';
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const PMCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: schedules = [], isLoading } = usePMSchedules();

  const getSchedulesForDate = (date: Date): PMScheduleWithAssets[] => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.next_due_date), date)
    );
  };

  const getDateClassName = (date: Date): string => {
    const schedulesForDate = getSchedulesForDate(date);
    if (schedulesForDate.length === 0) return '';
    
    const hasOverdue = schedulesForDate.some(s => new Date(s.next_due_date) < new Date());
    if (hasOverdue) return 'bg-red-100 text-red-900';
    
    return 'bg-blue-100 text-blue-900';
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-80 w-full" />
        </div>
        <div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasSchedules: (date) => getSchedulesForDate(date).length > 0,
              }}
              modifiersClassNames={{
                hasSchedules: 'bg-blue-100 text-blue-900 font-semibold',
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {selectedDateSchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No maintenance scheduled for this date.
                  </p>
                ) : (
                  selectedDateSchedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{schedule.name}</h4>
                        <Badge 
                          variant={new Date(schedule.next_due_date) < new Date() ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {new Date(schedule.next_due_date) < new Date() ? 'Overdue' : 'Due'}
                        </Badge>
                      </div>
                      
                      {schedule.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {schedule.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Assets: {schedule.assets?.length || 0}
                      </div>
                      
                      {schedule.assets && schedule.assets.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            Equipment:
                          </div>
                          <div className="space-y-1">
                            {schedule.assets.slice(0, 3).map((asset) => (
                              <div key={asset.id} className="text-xs bg-gray-50 rounded px-2 py-1">
                                {asset.name}
                                {asset.asset_tag && (
                                  <span className="text-muted-foreground ml-1">
                                    #{asset.asset_tag}
                                  </span>
                                )}
                              </div>
                            ))}
                            {schedule.assets.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{schedule.assets.length - 3} more...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a date to view scheduled maintenance.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
