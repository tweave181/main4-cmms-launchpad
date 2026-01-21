
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { BarcodeScanFAB } from '@/components/barcode/BarcodeScanFAB';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <TopBar />
          <div className="flex-1">
            {children}
          </div>
        </main>
        <BarcodeScanFAB />
      </div>
    </SidebarProvider>
  );
};
