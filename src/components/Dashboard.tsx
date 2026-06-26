import React from 'react';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { AdminPanel } from '@/components/dashboard/AdminPanel';
import { UpcomingContractRenewals } from '@/components/dashboard/UpcomingContractRenewals';
import { RecentEmailActivity } from '@/components/dashboard/RecentEmailActivity';
import { SetupReminderBanner } from '@/components/dashboard/SetupReminderBanner';
import { PageBanner } from '@/components/ui/page-banner';
import { LayoutDashboard } from 'lucide-react';
const Dashboard: React.FC = () => {
  return <div className="p-6">
      <PageBanner
        variant="dashboard"
        title="Operations Dashboard"
        subtitle="Your engineering control center — assets, work, and people at a glance."
        icon={<LayoutDashboard className="h-6 w-6" />}
      />
      <SetupReminderBanner />
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <WelcomeCard />
            <QuickActions />
            <AdminPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <DashboardStats />
            <RecentEmailActivity />
            <UpcomingContractRenewals />
        </div>
    </div>
    </div>;
};
export default Dashboard;