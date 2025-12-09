import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface SetupItem {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  count?: number;
  link?: string;
  linkText?: string;
}

export interface SetupSection {
  id: string;
  title: string;
  icon: string;
  items: SetupItem[];
  isAutoConfigured?: boolean;
}

export interface TenantSetupStatus {
  tenantName: string;
  businessType: string | null;
  sections: SetupSection[];
  totalItems: number;
  completedItems: number;
  percentComplete: number;
  isFullySetup: boolean;
  isLoading: boolean;
  setupWizardDismissed: boolean;
}

export const useTenantSetupStatus = () => {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;

  return useQuery({
    queryKey: ['tenant-setup-status', tenantId],
    queryFn: async (): Promise<TenantSetupStatus> => {
      if (!tenantId) {
        throw new Error('No tenant ID');
      }

      // Fetch all counts in parallel
      const [
        tenantResult,
        departmentsResult,
        categoriesResult,
        locationLevelsResult,
        jobTitlesResult,
        programSettingsResult,
        locationsResult,
        assetsResult,
        usersResult,
        checklistItemsResult,
        checklistRecordsResult,
        pmSchedulesResult,
        addressesResult,
        contractsResult,
      ] = await Promise.all([
        supabase.from('tenants').select('name, business_type').eq('id', tenantId).single(),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('categories').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('location_levels').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('job_titles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('program_settings').select('id, setup_wizard_dismissed').eq('tenant_id', tenantId).single(),
        supabase.from('locations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('assets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('checklist_item_templates').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('checklist_records').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('preventive_maintenance_schedules').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('service_contracts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      ]);

      const tenantName = tenantResult.data?.name || 'Your Organization';
      const businessType = tenantResult.data?.business_type || null;
      const setupWizardDismissed = programSettingsResult.data?.setup_wizard_dismissed || false;

      const departmentsCount = departmentsResult.count || 0;
      const categoriesCount = categoriesResult.count || 0;
      const locationLevelsCount = locationLevelsResult.count || 0;
      const jobTitlesCount = jobTitlesResult.count || 0;
      const hasSettings = !!programSettingsResult.data;
      const locationsCount = locationsResult.count || 0;
      const assetsCount = assetsResult.count || 0;
      const usersCount = usersResult.count || 0;
      const checklistItemsCount = checklistItemsResult.count || 0;
      const checklistRecordsCount = checklistRecordsResult.count || 0;
      const pmSchedulesCount = pmSchedulesResult.count || 0;
      const addressesCount = addressesResult.count || 0;
      const contractsCount = contractsResult.count || 0;

      const sections: SetupSection[] = [
        {
          id: 'foundation',
          title: 'Foundation (Auto-configured)',
          icon: '✅',
          isAutoConfigured: true,
          items: [
            {
              id: 'departments',
              title: 'Departments',
              description: departmentsCount > 0 ? `${departmentsCount} configured` : 'Not configured',
              isComplete: departmentsCount > 0,
              count: departmentsCount,
              link: '/admin/departments',
              linkText: 'Manage Departments',
            },
            {
              id: 'categories',
              title: 'Asset Categories',
              description: categoriesCount > 0 ? `${categoriesCount} configured` : 'Not configured',
              isComplete: categoriesCount > 0,
              count: categoriesCount,
              link: '/admin/categories',
              linkText: 'Manage Categories',
            },
            {
              id: 'location-levels',
              title: 'Location Levels',
              description: locationLevelsCount > 0 ? `${locationLevelsCount} configured` : 'Not configured',
              isComplete: locationLevelsCount > 0,
              count: locationLevelsCount,
              link: '/admin/location-levels',
              linkText: 'Manage Location Levels',
            },
            {
              id: 'job-titles',
              title: 'Job Titles',
              description: jobTitlesCount > 0 ? `${jobTitlesCount} configured` : 'Not configured',
              isComplete: jobTitlesCount > 0,
              count: jobTitlesCount,
              link: '/admin/job-titles',
              linkText: 'Manage Job Titles',
            },
            {
              id: 'settings',
              title: 'Program Settings',
              description: hasSettings ? 'Configured' : 'Not configured',
              isComplete: hasSettings,
              link: '/settings',
              linkText: 'Manage Settings',
            },
          ],
        },
        {
          id: 'getting-started',
          title: 'Getting Started',
          icon: '🚀',
          items: [
            {
              id: 'first-location',
              title: 'Create Your First Location',
              description: locationsCount > 0 
                ? `${locationsCount} location${locationsCount > 1 ? 's' : ''} created` 
                : 'Define where your assets are located',
              isComplete: locationsCount > 0,
              count: locationsCount,
              link: '/locations',
              linkText: 'Add Location',
            },
            {
              id: 'first-asset',
              title: 'Register Your First Asset',
              description: assetsCount > 0 
                ? `${assetsCount} asset${assetsCount > 1 ? 's' : ''} registered` 
                : 'Add equipment you need to maintain',
              isComplete: assetsCount > 0,
              count: assetsCount,
              link: '/assets',
              linkText: 'Add Asset',
            },
            {
              id: 'team-members',
              title: 'Invite Team Members',
              description: usersCount > 1 
                ? `${usersCount} user${usersCount > 1 ? 's' : ''} in your team` 
                : 'Add users who will work in the system',
              isComplete: usersCount > 1,
              count: usersCount,
              link: '/admin/users',
              linkText: 'Manage Users',
            },
          ],
        },
        {
          id: 'advanced',
          title: 'Advanced Configuration (Optional)',
          icon: '⚙️',
          items: [
            {
              id: 'checklist-items',
              title: 'Create Checklist Items',
              description: checklistItemsCount > 0 
                ? `${checklistItemsCount} item${checklistItemsCount > 1 ? 's' : ''} created` 
                : 'Build reusable maintenance checklist items',
              isComplete: checklistItemsCount > 0,
              count: checklistItemsCount,
              link: '/admin/checklist-library',
              linkText: 'Manage Checklist Items',
            },
            {
              id: 'checklist-records',
              title: 'Create Checklist Records',
              description: checklistRecordsCount > 0 
                ? `${checklistRecordsCount} record${checklistRecordsCount > 1 ? 's' : ''} created` 
                : 'Group checklist items into reusable records',
              isComplete: checklistRecordsCount > 0,
              count: checklistRecordsCount,
              link: '/admin/checklist-records',
              linkText: 'Manage Checklist Records',
            },
            {
              id: 'pm-schedules',
              title: 'Set Up Maintenance Schedules',
              description: pmSchedulesCount > 0 
                ? `${pmSchedulesCount} schedule${pmSchedulesCount > 1 ? 's' : ''} configured` 
                : 'Schedule preventive maintenance tasks',
              isComplete: pmSchedulesCount > 0,
              count: pmSchedulesCount,
              link: '/admin/work-schedules',
              linkText: 'Manage Schedules',
            },
            {
              id: 'address-book',
              title: 'Add Suppliers & Contractors',
              description: addressesCount > 0 
                ? `${addressesCount} contact${addressesCount > 1 ? 's' : ''} added` 
                : 'Store contact information for vendors',
              isComplete: addressesCount > 0,
              count: addressesCount,
              link: '/address-book',
              linkText: 'Manage Address Book',
            },
            {
              id: 'service-contracts',
              title: 'Configure Service Contracts',
              description: contractsCount > 0 
                ? `${contractsCount} contract${contractsCount > 1 ? 's' : ''} configured` 
                : 'Track maintenance agreements',
              isComplete: contractsCount > 0,
              count: contractsCount,
              link: '/service-contracts',
              linkText: 'Manage Contracts',
            },
          ],
        },
      ];

      // Calculate totals (exclude auto-configured foundation items from percentage)
      const essentialSections = sections.filter(s => !s.isAutoConfigured);
      const totalItems = essentialSections.reduce((acc, s) => acc + s.items.length, 0);
      const completedItems = essentialSections.reduce(
        (acc, s) => acc + s.items.filter(i => i.isComplete).length, 
        0
      );
      const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Consider fully setup if at least location and asset are created
      const isFullySetup = locationsCount > 0 && assetsCount > 0;

      return {
        tenantName,
        businessType,
        sections,
        totalItems,
        completedItems,
        percentComplete,
        isFullySetup,
        isLoading: false,
        setupWizardDismissed,
      };
    },
    enabled: !!tenantId,
  });
};
