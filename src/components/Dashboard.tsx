
import React from 'react';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { AdminPanel } from '@/components/dashboard/AdminPanel';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WelcomeCard />
          <QuickActions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DashboardStats />
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
