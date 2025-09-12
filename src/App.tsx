
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { GlobalSettingsProvider } from "@/contexts/GlobalSettingsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthNavigationHandler } from "@/components/auth/AuthNavigationHandler";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractNotificationWrapper } from "@/components/auth/ContractNotificationWrapper";
import { SessionTimeoutProvider } from "@/components/auth/SessionTimeoutProvider";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import AuthPage from "@/components/auth/AuthPage";

import Index from "./pages/Index";
import Assets from "./pages/Assets";
import WorkOrders from "./pages/WorkOrders";
import Maintenance from "./pages/Maintenance";
import MaintenanceJobDetail from "./pages/MaintenanceJobDetail";
import PMScheduleDetail from "./pages/PMScheduleDetail";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Departments from "./pages/Departments";
import DepartmentDetails from "./pages/DepartmentDetails";
import JobTitles from "./pages/JobTitles";
import JobTitleDetails from "./pages/JobTitleDetails";
import Companies from "./pages/Companies";
import Addresses from "./pages/Addresses";
import AddressDetail from "./pages/AddressDetail";
import Locations from "./pages/Locations";
import LocationLevels from "./pages/LocationLevels";
import LocationLevelDetails from "./pages/LocationLevelDetails";
import InventoryPartDetail from "./pages/InventoryPartDetail";
import AddressBook from "./pages/AddressBook";
import ServiceContracts from "./pages/ServiceContracts";
import AssetPrefixManager from "./pages/AssetPrefixManager";
import CategoryManager from "./pages/CategoryManager";
import SystemAuditLog from "./pages/SystemAuditLog";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <AuthProvider>
          <GlobalSettingsProvider>
              <SessionTimeoutProvider>
                <AuthNavigationHandler />
                <ContractNotificationWrapper>
                  <Routes>
                     <Route path="/auth" element={<AuthPage />} />
                     <Route path="/*" element={
                       <ProtectedRoute>
                         <AppLayout>
                           <Routes>
                             <Route path="/" element={<Index />} />
                             <Route path="/assets" element={<Assets />} />
                             <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance/:jobId" element={<MaintenanceJobDetail />} />
              <Route path="/pm/new" element={<PMScheduleDetail />} />
              <Route path="/pm/:id" element={<PMScheduleDetail />} />
                 <Route path="/inventory" element={<Inventory />} />
                 <Route path="/inventory/:id" element={<InventoryPartDetail />} />
                 <Route path="/inventory/:id/edit" element={<InventoryPartDetail />} />
                              <Route path="/address-book" element={<AddressBook />} />
                              <Route path="/address-book/:id" element={<AddressDetail />} />
                              <Route path="/reports" element={<Reports />} />
                               <Route path="/users" element={<UserManagement />} />
                               <Route path="/addresses" element={<Addresses />} />
                               <Route path="/addresses/:id" element={<AddressDetail />} />
                              <Route path="/admin/service-contracts" element={<ServiceContracts />} />
                              <Route path="/system-audit-log" element={<SystemAuditLog />} />
                              <Route path="/settings" element={<AdminSettings />} />
                              
                              {/* New Preferences Routes */}
                              <Route path="/admin/preferences/company" element={<Companies />} />
                              <Route path="/admin/preferences/departments" element={<Departments />} />
                              <Route path="/admin/preferences/departments/:id" element={<DepartmentDetails />} />
                              <Route path="/admin/preferences/job-titles" element={<JobTitles />} />
                              <Route path="/admin/preferences/job-titles/:id" element={<JobTitleDetails />} />
                              <Route path="/admin/preferences/location-levels" element={<LocationLevels />} />
                              <Route path="/admin/preferences/location-levels/:id" element={<LocationLevelDetails />} />
                              <Route path="/admin/preferences/locations" element={<Locations />} />
                              <Route path="/admin/preferences/categories" element={<CategoryManager />} />
                              <Route path="/admin/preferences/asset-prefixes" element={<AssetPrefixManager />} />
                              
                              {/* Legacy Route Redirects */}
                              <Route path="/departments" element={<Navigate to="/admin/preferences/departments" replace />} />
                              <Route path="/departments/:id" element={<Navigate to="/admin/preferences/departments" replace />} />
                              <Route path="/job-titles" element={<Navigate to="/admin/preferences/job-titles" replace />} />
                              <Route path="/job-titles/:id" element={<Navigate to="/admin/preferences/job-titles" replace />} />
                              <Route path="/location-levels" element={<Navigate to="/admin/preferences/location-levels" replace />} />
                              <Route path="/location-levels/:id" element={<Navigate to="/admin/preferences/location-levels" replace />} />
                              <Route path="/companies" element={<Navigate to="/admin/preferences/company" replace />} />
                              <Route path="/locations" element={<Navigate to="/admin/preferences/locations" replace />} />
                              <Route path="/categories" element={<Navigate to="/admin/preferences/categories" replace />} />
                              <Route path="/asset-prefixes" element={<Navigate to="/admin/preferences/asset-prefixes" replace />} />
                             <Route path="*" element={<NotFound />} />
                           </Routes>
                         </AppLayout>
                       </ProtectedRoute>
                     } />
                    </Routes>
                  </ContractNotificationWrapper>
                </SessionTimeoutProvider>
          </GlobalSettingsProvider>
        </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
