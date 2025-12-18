import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Building2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  return <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold bg-lime-400">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default" onClick={() => navigate('/work-orders')}>
          <Wrench className="w-5 h-5 mr-2" />
          Create Work Order
        </Button>
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default" onClick={() => navigate('/assets')}>
          <Building2 className="w-5 h-5 mr-2" />
          View Assets
        </Button>
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default" onClick={() => navigate('/maintenance')}>
          <Calendar className="w-5 h-5 mr-2" />
          Schedule Maintenance
        </Button>
      </CardContent>
    </Card>;
};