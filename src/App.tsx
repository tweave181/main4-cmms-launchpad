
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import AuthPage from "@/components/auth/AuthPage";
import AccountSetupRequired from "@/components/auth/AccountSetupRequired";
import Dashboard from "@/components/Dashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import WorkOrders from "@/pages/WorkOrders";
import Assets from "@/pages/Assets";
import Maintenance from "@/pages/Maintenance";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import Vendors from "@/pages/Vendors";
import Departments from "@/pages/Departments";
import AdminSettings from "@/pages/AdminSettings";
import UserManagement from "@/pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading, profileStatus, profileError, retryProfileFetch } = useAuth();

  // Show loading spinner while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login page if no user
  if (!user) {
    return <AuthPage />;
  }

  // Handle profile status after user is authenticated
  if (profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Show account setup screen for missing profiles
  if (profileStatus === 'missing') {
    return <AccountSetupRequired reason="missing" />;
  }

  // Show account setup screen for profile errors with retry option
  if (profileStatus === 'error') {
    return (
      <AccountSetupRequired 
        reason="error" 
        errorMessage={profileError || undefined}
        onRetry={retryProfileFetch}
      />
    );
  }

  // Show main app when profile is ready
  return (
    <AppLayout>
      <OfflineIndicator />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
