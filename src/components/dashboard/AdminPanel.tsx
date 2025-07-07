
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Settings, Cog } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

export const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Admin Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
          <Users className="w-5 h-5 mr-2" />
          Manage Users
        </Button>
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
          <Settings className="w-5 h-5 mr-2" />
          Organization Settings
        </Button>
        <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
          <Cog className="w-5 h-5 mr-2" />
          System Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
