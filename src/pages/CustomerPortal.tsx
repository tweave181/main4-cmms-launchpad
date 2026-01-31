import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkRequestForm } from '@/components/work-requests/WorkRequestForm';
import { MyRequestsList } from '@/components/work-requests/MyRequestsList';
import { useAuth } from '@/contexts/auth';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerProfileCard } from '@/components/customers/CustomerProfileCard';
import { ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerPortal: React.FC = () => {
  const { user } = useAuth();
  const { customer, isAuthenticated: isCustomerAuth, logout } = useCustomerAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/customer-login');
  };
  
  // Show customer-specific header if logged in as customer
  const displayName = isCustomerAuth && customer ? customer.name : user?.email;
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Submit a Work Request</h1>
          </div>
          {isCustomerAuth && (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Report an issue or request maintenance. Your request will be reviewed by our team.
        </p>
      </div>
      
      {/* Show customer profile card if logged in as customer */}
      {isCustomerAuth && customer && (
        <div className="mb-6">
          <CustomerProfileCard customer={customer} compact />
        </div>
      )}
      
      {/* Show simple logged in message for staff users */}
      {!isCustomerAuth && displayName && (
        <p className="text-sm text-muted-foreground mb-6">
          Logged in as: <strong>{displayName}</strong>
        </p>
      )}
      
      <div className="space-y-8">
        <WorkRequestForm />
        
        <MyRequestsList />
      </div>
    </div>
  );
};

export default CustomerPortal;
