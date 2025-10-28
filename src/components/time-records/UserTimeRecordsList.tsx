import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { useTimeRecords } from '@/hooks/useTimeRecords';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { TimeRecordsList } from './TimeRecordsList';

interface UserTimeRecordsListProps {
  userId: string;
}

export const UserTimeRecordsList: React.FC<UserTimeRecordsListProps> = ({ userId }) => {
  const { formatDate } = useGlobalSettings();
  const { data: timeRecords = [], isLoading } = useTimeRecords({ user_id: userId });

  // Calculate summary statistics
  const totalHours = timeRecords.reduce((sum, record) => sum + record.hours_worked, 0);
  const recordCount = timeRecords.length;
  
  // Calculate date range
  const dates = timeRecords.map(r => new Date(r.work_date).getTime()).filter(Boolean);
  const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
  const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  
  // Calculate average hours per day (only for days with records)
  const avgHoursPerDay = recordCount > 0 ? (totalHours / recordCount).toFixed(2) : '0.00';

  if (isLoading) {
    return <div className="text-center py-4">Loading time records...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalHours.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{recordCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Time Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{avgHoursPerDay}</div>
              <div className="text-sm text-muted-foreground mt-1">Avg Hours/Record</div>
            </div>
          </div>
          
          {earliestDate && latestDate && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Period: {formatDate(earliestDate.toISOString())} - {formatDate(latestDate.toISOString())}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Records List */}
      <TimeRecordsList userId={userId} showUserColumn={false} />
    </div>
  );
};
