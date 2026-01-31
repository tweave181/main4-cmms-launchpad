import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, CustomerSession } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (name: string, password: string, tenantId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'customer_session';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session: CustomerSession = JSON.parse(stored);
        setCustomer(session.customer);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (name: string, password: string, tenantId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-auth', {
        body: { action: 'login', name, password, tenant_id: tenantId },
      });

      if (error || !data?.success) {
        // Supabase returns non-2xx responses as an error; the JSON body is on error.context.
        if (error instanceof FunctionsHttpError) {
          try {
            const body = await error.context.json();
            return { success: false, error: body?.error || body?.message || 'Login failed' };
          } catch {
            // fall through
          }
        }

        return { success: false, error: (data as any)?.error || error?.message || 'Login failed' };
      }

      const session: CustomerSession = {
        customer: data.customer,
        token: data.token,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setCustomer(data.customer);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
