
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <BarChart className="h-6 w-6 text-primary" />
            <span>Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
