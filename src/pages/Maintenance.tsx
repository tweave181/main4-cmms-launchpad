import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReusableTabs } from '@/components/ui/reusable-tabs';
import { Calendar, Plus, List, CalendarIcon } from 'lucide-react';
import { PMScheduleList } from '@/components/maintenance/PMScheduleList';
import { PMCalendarView } from '@/components/maintenance/PMCalendarView';
import { useNavigate } from 'react-router-dom';

const Maintenance: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-slate-950">Preventive Maintenance List</span>
            </CardTitle>
            <Button onClick={() => navigate('/pm/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create PM
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReusableTabs
            tabs={[
              {
                value: "list",
                label: "Schedule List",
                icon: List,
                content: <PMScheduleList />
              },
              {
                value: "calendar",
                label: "Calendar View",
                icon: CalendarIcon,
                content: <PMCalendarView />
              }
            ]}
            defaultValue="list"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;