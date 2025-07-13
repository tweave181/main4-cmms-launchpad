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
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'system_admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking system admin status:', error);
          setIsSystemAdmin(false);
        } else {
          setIsSystemAdmin(!!data);
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