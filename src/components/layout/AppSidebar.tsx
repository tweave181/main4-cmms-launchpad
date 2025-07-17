
import React from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from '@/components/ui/sidebar';
import { Home, Wrench, Package, Calendar, BarChart3, Tag, Users, Settings, Cog, Building2, FileText, Briefcase, MapPin, ScrollText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const AppSidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Wrench, label: 'Work Orders', href: '/work-orders' },
    { icon: Tag, label: 'Assets', href: '/assets' },
    { icon: Calendar, label: 'Maintenance', href: '/maintenance' },
    { icon: Package, label: 'Inventory', href: '/inventory' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
  ];

  const adminItems = [
    { icon: Users, label: 'User Management', href: '/users' },
    { icon: Building2, label: 'Departments', href: '/departments' },
    { icon: Briefcase, label: 'Job Titles', href: '/job-titles' },
    { icon: Building2, label: 'Company Details', href: '/companies' },
    { icon: MapPin, label: 'Addresses', href: '/addresses' },
    { icon: ScrollText, label: 'Service Contracts', href: '/admin/service-contracts' },
    { icon: Cog, label: 'Asset Prefixes', href: '/asset-prefixes' },
    { icon: FileText, label: 'System Audit Log', href: '/system-audit-log' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">CMMS Pro</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <Link to={item.href} className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {isAdmin && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </div>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={
                    location.pathname === item.href || 
                    (item.href.startsWith('/admin') && location.pathname.startsWith(item.href))
                  }>
                    <Link to={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
