import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { Home, Wrench, Package, Calendar, BarChart3, Tag, Users, Settings, Cog, Building2, FileText, Briefcase, MapPin, ScrollText, BookOpen, FolderOpen, ChevronDown, ChevronRight, Mail, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useSimpleSystemAdminCheck } from '@/hooks/useSimpleSystemAdminCheck';
export const AppSidebar = () => {
  const location = useLocation();
  const {
    isAdmin,
    user
  } = useAuth();
  const {
    organizationName
  } = useGlobalSettings();
  const {
    isSystemAdmin
  } = useSimpleSystemAdminCheck(user);
  const [preferencesOpen, setPreferencesOpen] = useState(location.pathname.startsWith('/admin/preferences'));
  const menuItems = [{
    icon: Home,
    label: 'Dashboard',
    href: '/'
  }, {
    icon: Wrench,
    label: 'Work Orders',
    href: '/work-orders'
  }, {
    icon: Tag,
    label: 'Assets',
    href: '/assets'
  }, {
    icon: Calendar,
    label: 'Maintenance Records',
    href: '/maintenance'
  }, {
    icon: Package,
    label: 'Inventory',
    href: '/inventory'
  }, {
    icon: BookOpen,
    label: 'Address Book',
    href: '/address-book'
  }, {
    icon: BarChart3,
    label: 'Reports',
    href: '/reports'
  }];
  const adminItems = [{
    icon: Users,
    label: 'User Management',
    href: '/users'
  }, {
    icon: MapPin,
    label: 'Addresses',
    href: '/addresses'
  }, {
    icon: ScrollText,
    label: 'Service Contracts',
    href: '/admin/service-contracts'
  }, {
    icon: Calendar,
    label: 'Work Schedules',
    href: '/admin/work-schedules'
  }, {
    icon: BookOpen,
    label: 'Checklist Records',
    href: '/admin/checklist-records'
  }, {
    icon: BookOpen,
    label: 'Checklist Lines Library',
    href: '/admin/checklist-library'
  }, {
    icon: Mail,
    label: 'Email Logs',
    href: '/admin/email-logs'
  }, {
    icon: FileText,
    label: 'System Audit Log',
    href: '/system-audit-log'
  }, {
    icon: Settings,
    label: 'System Settings',
    href: '/settings'
  }];
  const preferencesItems = [{
    icon: Building2,
    label: 'Company Details',
    href: '/admin/preferences/company'
  }, {
    icon: Building2,
    label: 'Departments',
    href: '/admin/preferences/departments'
  }, {
    icon: Briefcase,
    label: 'Job Titles',
    href: '/admin/preferences/job-titles'
  }, {
    icon: MapPin,
    label: 'Location Levels',
    href: '/admin/preferences/location-levels'
  }, {
    icon: MapPin,
    label: 'Locations',
    href: '/admin/preferences/locations'
  }, {
    icon: FolderOpen,
    label: 'Asset Categories',
    href: '/admin/preferences/categories'
  }, {
    icon: Tag,
    label: 'Spare Parts Categories',
    href: '/spare-parts-categories'
  }, {
    icon: Cog,
    label: 'Asset Prefixes',
    href: '/admin/preferences/asset-prefixes'
  }, {
    icon: Calendar,
    label: 'Frequency Types',
    href: '/admin/preferences/frequency-types'
  }];
  return <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">{organizationName}</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main Menu
          </div>
          {menuItems.map(item => <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <Link to={item.href} className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          
          {isAdmin && <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 bg-sky-300">
                Admin
              </div>
              {adminItems.map(item => <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href || item.href.startsWith('/admin') && location.pathname.startsWith(item.href)}>
                    <Link to={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setPreferencesOpen(!preferencesOpen)} className="flex items-center space-x-3 w-full justify-between" isActive={location.pathname.startsWith('/admin/preferences')}>
                  <div className="flex items-center space-x-3 bg-sky-300">
                    <Settings className="h-4 w-4" />
                    <span>Preferences</span>
                  </div>
                  {preferencesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {preferencesOpen && <div className="ml-4">
                  {preferencesItems.map(item => <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                        <Link to={item.href} className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </div>}
            </>}

          {isSystemAdmin && <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 bg-sky-300">
                System Admin
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/system-admin/tenants'}>
                  <Link to="/system-admin/tenants" className="flex items-center space-x-3">
                    <Shield className="h-4 w-4" />
                    <span>Tenant Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>;
};