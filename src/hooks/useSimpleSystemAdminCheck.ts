import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Fix: Simple system admin check that doesn't rely on React Query
export const useSimpleSystemAdminCheck = (user: User | null) => {
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setIsSystemAdmin(false);
      return;
    }

    const checkSystemAdmin = async () => {
      setIsLoading(true);
      try {
        // Check 1: Does user have system_admin role?
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'system_admin')
          .single();

        if (roleData) {
          setIsSystemAdmin(true);
          return;
        }

        // Check 2: Is user's tenant a test site?
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userData?.tenant_id) {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('is_test_site')
            .eq('id', userData.tenant_id)
            .single();

          setIsSystemAdmin(tenantData?.is_test_site === true);
        } else {
          setIsSystemAdmin(false);
        }
      } catch (error) {
        console.error('System admin check failed:', error);
        setIsSystemAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemAdmin();
  }, [user?.id]);

  return { isSystemAdmin, isLoading };
};