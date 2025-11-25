import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, Tag } from 'lucide-react';
import { usePMSchedules } from '@/hooks/usePreventiveMaintenance';
import { format } from 'date-fns';

const WorkSchedules: React.FC = () => {
  const navigate = useNavigate();
  const { data: schedules = [], isLoading } = usePMSchedules();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading schedules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Work Schedules</h1>
          <p className="text-muted-foreground mt-1">
            Manage all preventive maintenance schedule definitions
          </p>
        </div>
        <Button onClick={() => navigate('/pm/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All PM Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No schedules created yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/pm/new')}
              >
                Create Your First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => navigate(`/pm/${schedule.id}`)}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{schedule.name}</h3>
                        {!schedule.is_active && (
                          <span className="text-xs px-2 py-1 bg-muted rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {schedule.frequency_type === 'custom' 
                              ? `Every ${schedule.frequency_value} ${schedule.frequency_unit}`
                              : schedule.frequency_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>
                            {schedule.assets?.length || 0} asset(s)
                          </span>
                        </div>
                        
                        {schedule.assigned_user && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{schedule.assigned_user.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Next Due: </span>
                        <span className={
                          new Date(schedule.next_due_date) < new Date()
                            ? 'text-destructive font-medium'
                            : new Date(schedule.next_due_date).toDateString() === new Date().toDateString()
                            ? 'text-amber-600 font-medium'
                            : 'text-foreground'
                        }>
                          {format(new Date(schedule.next_due_date), 'PPP')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkSchedules;
