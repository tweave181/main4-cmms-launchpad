import React from 'react';
import { WorkRequestForm } from '@/components/work-requests/WorkRequestForm';
import { MyRequestsList } from '@/components/work-requests/MyRequestsList';
import { useAuth } from '@/contexts/auth';
import { ClipboardList } from 'lucide-react';

const CustomerPortal: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Submit a Work Request</h1>
        </div>
        <p className="text-muted-foreground">
          Report an issue or request maintenance. Your request will be reviewed by our team.
        </p>
      </div>
      
      <div className="space-y-8">
        <WorkRequestForm />
        
        <MyRequestsList />
      </div>
    </div>
  );
};

export default CustomerPortal;
