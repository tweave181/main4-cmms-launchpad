import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface Permission {
  id: string;
  action: string;
  resource: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  permission: Permission;
}

// Hook to get all available permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
  });
};

// Hook to get permissions for a specific role
export const useRolePermissions = (role?: AppRole) => {
  return useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      if (!role) return [];

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          id,
          role,
          permission_id,
          permissions:permission_id (
            id,
            action,
            resource,
            description
          )
        `)
        .eq('role', role);

      if (error) throw error;
      return data;
    },
    enabled: !!role,
  });
};

// Hook to check if current user has a specific permission
export const useHasPermission = (action: string, resource: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-permission', user?.id, action, resource],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .rpc('user_has_permission', {
          _user_id: user.id,
          _action: action,
          _resource: resource,
        });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      return data as boolean;
    },
    enabled: !!user?.id,
  });
};

// Hook to get user permission overrides
export const useUserPermissionOverrides = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permission-overrides', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_permission_overrides')
        .select(`
          id,
          user_id,
          permission_id,
          granted,
          permissions:permission_id (
            id,
            action,
            resource,
            description
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook to get all permissions for current user (computed from roles + overrides)
export const useMyPermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      // Get role permissions
      const { data: rolePerms, error: rolePermsError } = await supabase
        .from('role_permissions')
        .select(`
          permissions:permission_id (
            id,
            action,
            resource,
            description
          )
        `)
        .in('role', userRoles.map(r => r.role));

      if (rolePermsError) throw rolePermsError;

      // Get user overrides
      const { data: overrides, error: overridesError } = await supabase
        .from('user_permission_overrides')
        .select(`
          permission_id,
          granted,
          permissions:permission_id (
            id,
            action,
            resource,
            description
          )
        `)
        .eq('user_id', user.id);

      if (overridesError) throw overridesError;

      // Combine permissions from roles
      const permissionMap = new Map<string, Permission>();
      
      rolePerms.forEach((rp: any) => {
        if (rp.permissions) {
          permissionMap.set(rp.permissions.id, rp.permissions);
        }
      });

      // Apply overrides
      overrides.forEach((override: any) => {
        if (override.granted) {
          if (override.permissions) {
            permissionMap.set(override.permissions.id, override.permissions);
          }
        } else {
          permissionMap.delete(override.permission_id);
        }
      });

      return Array.from(permissionMap.values());
    },
    enabled: !!user?.id,
  });
};
