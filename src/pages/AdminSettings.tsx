
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useProgramSettings } from '@/hooks/useProgramSettings';
import { SystemSettingsForm } from '@/components/program-settings/SystemSettingsForm';
import { CommentStatusManagement } from '@/components/admin/CommentStatusManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const { data: settings, isLoading, error } = useProgramSettings();

  // Only allow admin users to access this page
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading system settings...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error loading system settings. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Configure global system settings for your organization including localization, 
            branding, and operational preferences.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="comments">Comment Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <SystemSettingsForm settings={settings} />
        </TabsContent>
        
        <TabsContent value="comments">
          <CommentStatusManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
