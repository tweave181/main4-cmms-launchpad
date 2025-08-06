
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Departments from "./pages/Departments";
import DepartmentDetails from "./pages/DepartmentDetails";
import JobTitles from "./pages/JobTitles";
import JobTitleDetails from "./pages/JobTitleDetails";
import Companies from "./pages/Companies";
import Addresses from "./pages/Addresses";
import Locations from "./pages/Locations";
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
                             <Route path="/inventory" element={<Inventory />} />
                             <Route path="/address-book" element={<AddressBook />} />
                             <Route path="/reports" element={<Reports />} />
                             <Route path="/users" element={<UserManagement />} />
                             <Route path="/departments" element={<Departments />} />
                             <Route path="/departments/:id" element={<DepartmentDetails />} />
                             <Route path="/job-titles" element={<JobTitles />} />
                             <Route path="/job-titles/:id" element={<JobTitleDetails />} />
                              <Route path="/companies" element={<Companies />} />
                              <Route path="/addresses" element={<Addresses />} />
                              <Route path="/locations" element={<Locations />} />
                              <Route path="/admin/service-contracts" element={<ServiceContracts />} />
                             <Route path="/categories" element={<CategoryManager />} />
                             <Route path="/asset-prefixes" element={<AssetPrefixManager />} />
                             <Route path="/system-audit-log" element={<SystemAuditLog />} />
                             <Route path="/settings" element={<AdminSettings />} />
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
