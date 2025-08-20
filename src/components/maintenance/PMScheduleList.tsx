import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, User, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { usePMSchedules } from '@/hooks/usePreventiveMaintenance';
import { useNavigate } from 'react-router-dom';
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const PMScheduleList: React.FC = () => {
  const { data: schedules = [], isLoading } = usePMSchedules();
  const navigate = useNavigate();

  const getFrequencyText = (schedule: PMScheduleWithAssets) => {
    if (schedule.frequency_type === 'custom') {
      return `Every ${schedule.frequency_value} ${schedule.frequency_unit}`;
    }
    
    if (schedule.frequency_value === 1) {
      return schedule.frequency_type.charAt(0).toUpperCase() + schedule.frequency_type.slice(1);
    }
    
    return `Every ${schedule.frequency_value} ${schedule.frequency_type === 'daily' ? 'days' : 
           schedule.frequency_type === 'weekly' ? 'weeks' : 'months'}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return {
        variant: 'destructive' as const,
        text: `${Math.abs(daysUntilDue)} days overdue`
      };
    }
    if (daysUntilDue <= 14) {
      return {
        variant: 'default' as const,
        text: daysUntilDue === 0 ? 'Due today' : 'Due soon'
      };
    }
    return {
      variant: 'outline' as const,
      text: 'On track'
    };
  };

  const handleRowClick = (scheduleId: string) => {
    navigate(`/pm/${scheduleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="text-center py-12">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">No PM schedules</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first preventive maintenance schedule.
        </p>
      </div>
    );
  }

  // Sort schedules by next due date
  const sortedSchedules = [...schedules].sort((a, b) => {
    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
  });

  return (
    <div className="space-y-1">
      {sortedSchedules.map((schedule) => {
        const daysUntilDue = getDaysUntilDue(schedule.next_due_date);
        const statusBadge = getStatusBadge(daysUntilDue);
        
        return (
          <div
            key={schedule.id}
            onClick={() => handleRowClick(schedule.id)}
            className="group flex items-center h-16 px-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRowClick(schedule.id);
              }
            }}
          >
            {/* Title Banner */}
            <div className="flex-shrink-0 h-10 px-3 bg-primary/10 rounded-md flex items-center min-w-0 max-w-xs">
              <span 
                className="font-semibold text-sm text-foreground truncate"
                title={schedule.name}
              >
                {schedule.name}
              </span>
              {!schedule.is_active && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Content Columns */}
            <div className="flex-1 flex items-center justify-between ml-4 min-w-0">
              <div className="flex items-center space-x-6 min-w-0">
                {/* Next Due */}
                <div className="flex-shrink-0">
                  <p className="text-xs text-muted-foreground">Next Due</p>
                  <p className="text-sm font-medium">
                    {format(new Date(schedule.next_due_date), 'MMM dd')}
                  </p>
                </div>

                {/* Frequency */}
                <div className="flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="text-sm font-medium">
                    {getFrequencyText(schedule)}
                  </p>
                </div>

                {/* Assigned - Hidden on mobile */}
                <div className="flex-shrink-0 hidden md:block">
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="text-sm font-medium">
                    {schedule.assigned_user ? (
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {schedule.assigned_user.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </p>
                </div>

                {/* Assets - Hidden on mobile */}
                <div className="flex-shrink-0 hidden md:block">
                  <p className="text-xs text-muted-foreground">Assets</p>
                  <p className="text-sm font-medium">
                    {schedule.assets?.length || 0} assets
                  </p>
                </div>
              </div>

              {/* Status Badge and Chevron */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Badge variant={statusBadge.variant}>
                  {statusBadge.text}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
