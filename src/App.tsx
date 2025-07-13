
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import AuthPage from '@/components/auth/AuthPage';
import WorkOrders from '@/pages/WorkOrders';
import Assets from '@/pages/Assets';
import Maintenance from '@/pages/Maintenance';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import UserManagement from '@/pages/UserManagement';
import Departments from '@/pages/Departments';
import DepartmentDetails from '@/pages/DepartmentDetails';
import AssetPrefixManager from '@/pages/AssetPrefixManager';
import JobTitles from '@/pages/JobTitles';
import JobTitleDetails from '@/pages/JobTitleDetails';
import Companies from '@/pages/Companies';
import Addresses from '@/pages/Addresses';
import SystemAuditLog from '@/pages/SystemAuditLog';
import AdminSettings from '@/pages/AdminSettings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/assets" element={<Assets />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/departments/:id" element={<DepartmentDetails />} />
                      <Route path="/asset-prefixes" element={<AssetPrefixManager />} />
                      <Route path="/job-titles" element={<JobTitles />} />
                      <Route path="/job-titles/:id" element={<JobTitleDetails />} />
                      <Route path="/companies" element={<Companies />} />
                      <Route path="/addresses" element={<Addresses />} />
                      <Route path="/system-audit-log" element={<SystemAuditLog />} />
                      <Route path="/settings" element={<AdminSettings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
