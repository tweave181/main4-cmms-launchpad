
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Building2, Calendar } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold">Dashboard Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-primary" />
              <span className="text-base font-medium text-gray-700">Open Work Orders</span>
            </div>
            <span className="font-semibold text-lg">12</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" />
              <span className="text-base font-medium text-gray-700">Total Assets</span>
            </div>
            <span className="font-semibold text-lg">45</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              <span className="text-base font-medium text-gray-700">Scheduled Tasks</span>
            </div>
            <span className="font-semibold text-lg">8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
