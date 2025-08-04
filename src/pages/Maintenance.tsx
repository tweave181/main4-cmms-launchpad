
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, List, CalendarIcon } from 'lucide-react';
import { PMScheduleList } from '@/components/maintenance/PMScheduleList';
import { PMCalendarView } from '@/components/maintenance/PMCalendarView';
import { CreatePMModal } from '@/components/maintenance/CreatePMModal';

const Maintenance: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary" />
              <span>Preventive Maintenance</span>
            </CardTitle>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create PM
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <div className="mb-4">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="list" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Schedule List
                </TabsTrigger>
                <TabsTrigger value="calendar" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="mt-0">
              <PMScheduleList />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <PMCalendarView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreatePMModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
};

export default Maintenance;
